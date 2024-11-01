//
// sitServer.js
//
// Created by Robin Wilson 1/17/2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

"use strict";

/* global Entities Script */

(function (global) {

    var DEBUG = false;

    // Remotely callable
    // Resolves heartbeat called from sitClient
    SitServer.prototype.heartbeatResponse = function () {
        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Heartbeat reply received!");
        }
        // Called by remote client script
        // indicating avatar is still sitting in chair
        if (this.heartbeatRequestTimeout) {
            Script.clearTimeout(this.heartbeatRequestTimeout);
            this.heartbeatRequestTimeout = false;
        }
        if (this.nextHeartbeatTimeout) {
            Script.clearTimeout(this.nextHeartbeatTimeout);
            this.nextHeartbeatTimeout = false;
        }
        this.nextHeartbeatTimeout = Script.setTimeout(sendHeartbeatRequest, HEARTBEAT_INTERVAL_TIME_MS);
    };


    SitServer.prototype.sendHeartbeatRequest = function () {
        this.nextHeartbeatTimeout = false;

        if (this.isOccupied) {
            if (DEBUG) {
                console.log("sitServer.js: " + this.entityID + ": heartbeat: `isOccupied` is set to `true`. Sending heartbeatRequest to sitting client...");
            }

            this.callClient(this.currentClientSessionID, 'heartbeatRequest', []);

            if (this.heartbeatRequestTimeout) {
                Script.clearTimeout(this.heartbeatRequestTimeout);
                this.heartbeatRequestTimeout = false;
            }
    
            // If the heartbeatRequest call to the client script does not return heartbeatResponse
            // Will open the chair to other avatars to sit
            this.heartbeatRequestTimeout = Script.setTimeout(function () {
                if (DEBUG) {
                    console.log("sitServer.js: " + this.entityID + ": Heartbeat request timed out! Resetting seat occupied status...");
                }
                this.heartbeatRequestTimeout = false;
                // Seat is not occupied
                this.isOccupied = false;
                this.currentClientSessionID = false;

                // FIXME: This won't restore the sit overlay for other users.
            }, HEARTBEAT_TIMEOUT_MS);
        } else {
            if (DEBUG) {
                console.log("sitServer.js: " + this.entityID + ": We went to send a heartbeat, but the seat wasn't occupied. Aborting...");
            }

            this.currentClientSessionID = false;
            
            if (this.nextHeartbeatTimeout) {
                Script.clearTimeout(this.nextHeartbeatTimeout);
                this.nextHeartbeatTimeout = false;
            }
            if (this.heartbeatRequestTimeout) {
                Script.clearTimeout(this.heartbeatRequestTimeout);
                this.heartbeatRequestTimeout = false;
            }
        }
    };

    SitServer.prototype.requestSitData = function (id, args) {
        var requestingID = args[0];

        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Request for sit data received from:" + requestingID);
        }

        var replyData = {
            "isOccupied": this.isOccupied
        }

        replyData = JSON.stringify(replyData);

        this.callClient(requestingID, 'requestSitDataReply', [replyData]);
    };

    // Remotely callable
    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method that begins the sit down process
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var HEARTBEAT_TIMEOUT_MS = 2500; // ms
    SitServer.prototype.onMousePressOnEntity = function (id, param) {
        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Entering onMousePressOnEntity()..");
        }
        if (!this.isOccupied) {
            if (DEBUG) {
                console.log("sitServer.js: " + this.entityID + ": `isOccupied` is set to `false`");
            }
            this.currentClientSessionID = param[0];
            this.isOccupied = true;

            this.callClient(this.currentClientSessionID, 'checkBeforeSitDown', []);

            if (this.nextHeartbeatTimeout) {
                Script.clearTimeout(this.nextHeartbeatTimeout);
                this.nextHeartbeatTimeout = false;
            }
        }
    };


    // Remotely callable
    // Called from client to open the chair to other avatars
    SitServer.prototype.onStandUp = function (id, params) {
        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Entering `onStandUp()` for seat ID: " + id + "...");
        }

        this.isOccupied = false;
        this.currentClientSessionID = false;
        if (this.nextHeartbeatTimeout) {
            Script.clearTimeout(this.nextHeartbeatTimeout);
            this.nextHeartbeatTimeout = false;
        }
        if (this.heartbeatRequestTimeout) {
            Script.clearTimeout(this.heartbeatRequestTimeout);
            this.heartbeatRequestTimeout = false;
        }

        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Calling `createClickToSitOverlay()` for all avatars...");
        }
        if (this.isOccupied === false) {
            for (var i = 0; i < params.length; i++) {
                this.callClient(params[i], 'createClickToSitOverlay', []);
            }
        }
    };


    // Remotely callable
    SitServer.prototype.afterBeginSit = function (id, params) {
        if (DEBUG) {
            console.log("sitServer.js: " + this.entityID + ": Calling `deleteAllClickToSitOverlays()` for all avatars, then sending heartbeat request...");
        }
        for (var i = 0; i < params.length; i++) {
            this.callClient(params[i], 'deleteAllClickToSitOverlays', []);
        }
            
        sendHeartbeatRequest();
    };


    // Preload entity lifetime method
    SitServer.prototype.preload = function (id) {
        this.entityID = id;
        this.isOccupied = false;
    };


    // Unload entity lifetime method
    SitServer.prototype.unload = function () {
        this.isOccupied = false;
        this.currentClientSessionID = false;
        if (this.nextHeartbeatTimeout) {
            Script.clearTimeout(this.nextHeartbeatTimeout);
            this.nextHeartbeatTimeout = false;
        }
        if (this.heartbeatRequestTimeout) {
            Script.clearTimeout(this.heartbeatRequestTimeout);
            this.heartbeatRequestTimeout = false;
        }
    };

    SitServer.prototype.callClient = function (sessionId, methodName, params) {
        if (this.client) {
            this.client[methodName](this.entityID, params);
        }
        Entities.callEntityClientMethod(sessionId, this.entityID, methodName, params);
    };

    function SitServer() {
        this.isOccupied = false;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.nextHeartbeatTimeout = null;
        this.heartbeatRequestTimeout = null;
        
        this.remotelyCallable = [
            "requestSitData",
            "onMousePressOnEntity",
            "onStandUp",
            "heartbeatResponse",
            "afterBeginSit"
        ];
    }

    global.SitServer = SitServer;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
