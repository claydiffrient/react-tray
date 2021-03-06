import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { equal } from 'assert';
import ReactTray from '../../main';

let _currentDiv = null;

function renderTray(props, children, callback) {
  _currentDiv = document.createElement('div');
  document.body.appendChild(_currentDiv);
  return ReactDOM.render(<ReactTray {...props}>{children}</ReactTray>, _currentDiv, callback);
}

function unmountTray() {
  ReactDOM.unmountComponentAtNode(_currentDiv);
  document.body.removeChild(_currentDiv);
  _currentDiv = null;
}

/* eslint func-names:0 */
describe('react-tray', function() {
  afterEach(function() {
    unmountTray();
  });

  it('should not be visible when isOpen is false', function() {
    renderTray();
    equal(document.querySelectorAll('.ReactTray__Content').length, 0);
  });

  it('should be visible when isOpen is true', function() {
    renderTray({isOpen: true});
    equal(document.querySelectorAll('.ReactTray__Content').length, 1);
  });

  it('should receive focus when opened', function() {
    renderTray({isOpen: true});
    equal(document.querySelector('.ReactTray__Content'), document.activeElement);
  });

  it('should call onBlur when closed', function() {
    const blurred = false;
    renderTray({isOpen: true, onBlur: function() { blurred: true; }, closeTimeoutMS: 0});
    TestUtils.Simulate.click(document.querySelector('.ReactTray__Overlay'));
    setTimeout(function() {
      equal(blurred, true);
    }, 0);
  });

  it('should close on overlay click', function() {
    renderTray({isOpen: true, onBlur: function() {}, closeTimeoutMS: 0});
    TestUtils.Simulate.click(document.querySelector('.ReactTray__Overlay'));
    setTimeout(function() {
      equal(document.querySelectorAll('.ReactTray__Content').length, 0);
    }, 0);
  });

  it('should close on ESC key', function() {
    renderTray({isOpen: true, onBlur: function() {}, closeTimeoutMS: 0});
    TestUtils.Simulate.keyDown(document.querySelector('.ReactTray__Content'), {key: 'Esc'});
    setTimeout(function() {
      equal(document.querySelectorAll('.ReactTray__Content').length, 0);
    }, 0);
  });

  it('should close on blur by default', function() {
    renderTray({isOpen: true, onBlur: function() {}, closeTimeoutMS: 0});
    TestUtils.Simulate.keyDown(document.querySelector('.ReactTray__Content'), {key: 'Tab'});
    setTimeout(function() {
      equal(document.querySelectorAll('.ReactTray__Content').length, 0);
    }, 0);
  });

  it('should not close on blur', function() {
    renderTray({isOpen: true, onBlur: function() {}, closeTimeoutMS: 0, closeOnBlur: false});
    TestUtils.Simulate.keyDown(document.querySelector('.ReactTray__Content'), {key: 'Tab'});
    setTimeout(function() {
      equal(document.querySelectorAll('.ReactTray__Content').length, 1);
    }, 0);
  });

  describe('maintainFocus prop', function() {
    this.timeout(0);
    beforeEach(function(done) {
      const props = {isOpen: true, onBlur: function() {}, closeTimeoutMS: 0, maintainFocus: true};
      const children = (
        <div>
          <a href="#" id="one">One</a>
          <a href="#" id="two">Two</a>
          <a href="#" id="three">Three</a>
        </div>
      );
      renderTray(props, children, () => done());
    });

    it('sends focus to the first item if tabbing away from the last element', function() {
      const firstItem = document.querySelector('#one');
      const lastItem = document.querySelector('#three');
      lastItem.focus();
      TestUtils.Simulate.keyDown(document.querySelector('.ReactTray__Content'), {keyCode: 9});
      equal(document.activeElement, firstItem);
    });

    it('sends focus to the last item if shift + tabbing from the first item', function() {
      const firstItem = document.querySelector('#one');
      const lastItem = document.querySelector('#three');
      firstItem.focus();
      TestUtils.Simulate.keyDown(document.querySelector('.ReactTray__Content'), {keyCode: 9, shiftKey: true});
      equal(document.activeElement, lastItem);
    });
  });
});
