/* Copyright 2007-2009 WebDriver committers
 * Copyright 2007-2009 Google Inc.
 * Portions copyright 2011 Software Freedom Conservancy
 * Copyright 2014 Hugo Landau <hlandau@devever.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function OverrideService() {
  dump("nczilla: instantiating override component.\n");
  try {

    var originalCertOverrideCID = "{67ba681d-5485-4fff-952c-2ee337ffdcd6}";
    var base = Components.classesByID[originalCertOverrideCID].getService();
    base = base.QueryInterface(Components.interfaces.nsICertOverrideService);
    this.base = base;

    dump("nczilla: done instantiating override component.\n");
  } catch(e) {
    dump("nczilla: couldn't instantiate override component: " + e + ", " + e.stack + "\n");
  }
}

OverrideService.prototype = {
  classDescription: "nczilla certificate override component",
  classID: Components.ID("{405585b1-4cf3-4810-a80b-31109256afc3}"),
  contractID: "@mozilla.org/security/certoverride;1",
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICertOverrideService]),

  // implement nsICertOverrideService
  rememberValidityOverride: function(hostname, port, cert, overrideBits, isTemp) {
    return base.rememberValidityOverride(hostname, port, cert, overrideBits, isTemp);
  },

  hasMatchingOverride: function(aHostname, aPort, aCert, aOverrideBits, aIsTemp) {
    /* Uncomment the following to permit all certificates bearing hostname errors
     * or untrusted issuers
     */

    /*if (true) {
      aIsTemp.value = true;
      aOverrideBits.value = this.fillNeededBits(aCert, aHostname);
      return true;
    }*/

    return base.hasMatchingOverride(hostname, port, cert, overrideBits, isTemp);
  },

  getValidityOverride: function(hostname, port, hashalg, fingerprint, overrideBits, isTemp) {
    return base.getValidityOverride(hostname, port, hashalg, fingerprint, overrideBits, isTemp);
  },

  clearValidityOverride: function(hostname, port) {
    return base.clearValidityOverride(hostname, port);
  },

  getAllOverrideHostsWithPorts: function(count, hostsWithPorts) {
    return base.getAllOverrideHostsWithPorts(count, hostsWithPorts);
  },

  isCertUsedForOverrides: function(cert, checkTemporaries, checkPermanents) {
    return base.isCertUsedForOverrides(cert, checkTemporaries, checkPermanents);
  },

  // From selenium.googlecode.com trunk/javascript/firefox-driver/js/badCertListener.js
  fillNeededBits: function(cert, hostname) {
    var defaultBits = this.ERROR_UNTRUSTED;
    var bits = defaultBits;

    bits = bits | this._certificateHostnameMismatch(cert, hostname);

    return bits;
  },

  _certificateHostnameMismatch: function(cert, hostname) {
    var commonNameRE = new RegExp('^' + cert.commonName.replace('*', '[\\w|\-]+') + '$', 'i');
    if (hostname.match(commonNameRE) === null) {
      return this.ERROR_MISMATCH;
    }
    return 0;
  },

  ERROR_UNTRUSTED: 1,
  ERROR_MISMATCH: 2,
  ERROR_TIME: 4,

  _dummy: false
};

var components = [OverrideService];

if ("generateNSGetFactory" in XPCOMUtils)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule(components);

dump("nczilla: override component executed.\n");
