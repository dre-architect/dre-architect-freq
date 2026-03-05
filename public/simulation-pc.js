/*
 * FREQ AI - PlayCanvas barge drafting simulation
 * Engine: PlayCanvas (pc.* namespace)
 * Scripts: pc.createScript() API
 * UI overlays: vanilla HTML/CSS/JS
 */
(function () {
  'use strict';

  function whenPlayCanvasReady(callback) {
    if (typeof pc !== 'undefined') {
      callback();
      return;
    }

    var check = window.setInterval(function () {
      if (typeof pc !== 'undefined') {
        window.clearInterval(check);
        callback();
      }
    }, 50);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function average(values) {
    var keys = Object.keys(values);
    var total = 0;
    for (var i = 0; i < keys.length; i += 1) {
      total += values[keys[i]];
    }
    return total / keys.length;
  }

  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function formatFeet(value) {
    return value.toFixed(2) + ' ft';
  }

  function formatDegrees(value) {
    return value.toFixed(2) + ' deg';
  }

  function formatTons(value) {
    return Math.round(value) + ' t';
  }

  function describeLane(x) {
    if (x <= -8) return 'FORE';
    if (x <= -2) return 'FORE-MID';
    if (x < 6) return 'MID';
    if (x < 11) return 'AFT-MID';
    return 'AFT';
  }

  function isPresentationUnlocked() {
    return !window.simController || !!window.simController.presentationAuthorized;
  }

  whenPlayCanvasReady(function () {
    var canvas = document.getElementById('freqCanvas');
    if (!canvas) {
      return;
    }

    var app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      keyboard: new pc.Keyboard(window)
    });

    function resizeCanvas() {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      app.resizeCanvas();
    }

    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.start();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    app.scene.ambientLight = new pc.Color(0.05, 0.07, 0.12);

    var matHull = new pc.StandardMaterial();
    matHull.diffuse = new pc.Color(0.14, 0.15, 0.18);
    matHull.metalness = 0.7;
    matHull.gloss = 0.3;
    matHull.update();

    var matDeck = new pc.StandardMaterial();
    matDeck.diffuse = new pc.Color(0.22, 0.22, 0.25);
    matDeck.metalness = 0.4;
    matDeck.gloss = 0.2;
    matDeck.update();

    var matWater = new pc.StandardMaterial();
    matWater.diffuse = new pc.Color(0.03, 0.08, 0.15);
    matWater.emissive = new pc.Color(0.01, 0.03, 0.07);
    matWater.opacity = 0.88;
    matWater.blendType = pc.BLEND_NORMAL;
    matWater.gloss = 0.6;
    matWater.update();

    var matWaterline = new pc.StandardMaterial();
    matWaterline.diffuse = new pc.Color(0.02, 0.71, 0.83);
    matWaterline.emissive = new pc.Color(0.02, 0.71, 0.83);
    matWaterline.emissiveIntensity = 0.65;
    matWaterline.update();

    var matDock = new pc.StandardMaterial();
    matDock.diffuse = new pc.Color(0.23, 0.19, 0.16);
    matDock.gloss = 0.1;
    matDock.update();

    var matBollard = new pc.StandardMaterial();
    matBollard.diffuse = new pc.Color(0.3, 0.3, 0.32);
    matBollard.metalness = 0.7;
    matBollard.update();

    var matDraftMark = new pc.StandardMaterial();
    matDraftMark.diffuse = new pc.Color(0.85, 0.85, 0.85);
    matDraftMark.emissive = new pc.Color(0.25, 0.25, 0.25);
    matDraftMark.update();

    var matMarker = new pc.StandardMaterial();
    matMarker.diffuse = new pc.Color(0.02, 0.71, 0.83);
    matMarker.emissive = new pc.Color(0.02, 0.45, 0.52);
    matMarker.emissiveIntensity = 0.75;
    matMarker.update();

    var matMarkerActive = new pc.StandardMaterial();
    matMarkerActive.diffuse = new pc.Color(0.86, 0.97, 0.98);
    matMarkerActive.emissive = new pc.Color(0.02, 0.71, 0.83);
    matMarkerActive.emissiveIntensity = 1.2;
    matMarkerActive.update();

    var matCargoFill = new pc.StandardMaterial();
    matCargoFill.diffuse = new pc.Color(0.35, 0.30, 0.22);
    matCargoFill.emissive = new pc.Color(0.04, 0.03, 0.02);
    matCargoFill.emissiveIntensity = 0.1;
    matCargoFill.metalness = 0.0;
    matCargoFill.gloss = 0.05;
    matCargoFill.update();

    var matCrane = new pc.StandardMaterial();
    matCrane.diffuse = new pc.Color(0.46, 0.49, 0.54);
    matCrane.metalness = 0.72;
    matCrane.gloss = 0.25;
    matCrane.update();

    var matCraneAccent = new pc.StandardMaterial();
    matCraneAccent.diffuse = new pc.Color(0.82, 0.51, 0.16);
    matCraneAccent.metalness = 0.45;
    matCraneAccent.gloss = 0.28;
    matCraneAccent.update();

    var matCable = new pc.StandardMaterial();
    matCable.diffuse = new pc.Color(0.23, 0.26, 0.31);
    matCable.metalness = 0.8;
    matCable.gloss = 0.12;
    matCable.update();

    var matScanBeam = new pc.StandardMaterial();
    matScanBeam.diffuse = new pc.Color(0.02, 0.8, 0.9);
    matScanBeam.emissive = new pc.Color(0.04, 0.7, 0.8);
    matScanBeam.emissiveIntensity = 1.5;
    matScanBeam.opacity = 0.4;
    matScanBeam.blendType = pc.BLEND_ADDITIVE;
    matScanBeam.update();

    var matDataLink = new pc.StandardMaterial();
    matDataLink.diffuse = new pc.Color(0.08, 0.72, 0.96);
    matDataLink.emissive = new pc.Color(0.08, 0.62, 0.92);
    matDataLink.emissiveIntensity = 1.2;
    matDataLink.opacity = 0.48;
    matDataLink.blendType = pc.BLEND_ADDITIVE;
    matDataLink.update();

    var hullInnerLength = 40;
    var hullInnerWidth = 6.5;
    var cargoFillFloorY = -0.8;
    var cargoFillMaxHeight = 2.5;
    var craneBasePosition = { x: -18, y: 0.1, z: -10.8 };
    var craneLaneTargets = [-12, -4, 4, 12];

    var worldRoot = new pc.Entity('worldRoot');
    app.root.addChild(worldRoot);

    var water = new pc.Entity('waterPlane');
    water.addComponent('render', { type: 'plane' });
    water.setLocalScale(220, 1, 220);
    water.setLocalEulerAngles(-90, 0, 0);
    water.setPosition(0, -0.5, 0);
    water.render.meshInstances[0].material = matWater;
    worldRoot.addChild(water);

    var dock = new pc.Entity('dock');
    dock.addComponent('render', { type: 'box' });
    dock.setLocalScale(54, 3, 6);
    dock.setPosition(0, 0, -8);
    dock.render.meshInstances[0].material = matDock;
    worldRoot.addChild(dock);

    for (var bollardIndex = -2; bollardIndex <= 2; bollardIndex += 1) {
      var bollard = new pc.Entity('bollard_' + bollardIndex);
      bollard.addComponent('render', { type: 'cylinder' });
      bollard.setLocalScale(0.45, 1.2, 0.45);
      bollard.setPosition(bollardIndex * 10, 2.1, -5.2);
      bollard.render.meshInstances[0].material = matBollard;
      worldRoot.addChild(bollard);
    }

    var dockLight1 = new pc.Entity('dockLight1');
    dockLight1.addComponent('light', {
      type: 'point',
      color: new pc.Color(1.0, 0.62, 0.2),
      intensity: 0.45,
      range: 28
    });
    dockLight1.setPosition(-12, 12, -8);
    worldRoot.addChild(dockLight1);

    var dockLight2 = new pc.Entity('dockLight2');
    dockLight2.addComponent('light', {
      type: 'point',
      color: new pc.Color(1.0, 0.62, 0.2),
      intensity: 0.45,
      range: 28
    });
    dockLight2.setPosition(12, 12, -8);
    worldRoot.addChild(dockLight2);

    var keyLight = new pc.Entity('keyLight');
    keyLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.6, 0.72, 0.88),
      intensity: 0.9,
      castShadows: true,
      shadowResolution: 2048,
      shadowBias: 0.05,
      normalOffsetBias: 0.05
    });
    keyLight.setEulerAngles(45, -30, 0);
    worldRoot.addChild(keyLight);

    var fillLight = new pc.Entity('fillLight');
    fillLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.9, 0.72, 0.45),
      intensity: 0.18
    });
    fillLight.setEulerAngles(30, 120, 0);
    worldRoot.addChild(fillLight);

    var waterline = new pc.Entity('waterline');
    waterline.addComponent('render', { type: 'box' });
    waterline.setLocalScale(42.2, 0.06, 8.2);
    waterline.setPosition(0, -0.48, 0);
    waterline.render.meshInstances[0].material = matWaterline;
    worldRoot.addChild(waterline);

    var bargeRoot = new pc.Entity('bargeRoot');
    worldRoot.addChild(bargeRoot);

    var hullFloor = new pc.Entity('bargeHullFloor');
    hullFloor.addComponent('render', { type: 'box' });
    hullFloor.setLocalScale(42, 0.35, 8);
    hullFloor.setLocalPosition(0, -2.82, 0);
    hullFloor.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(hullFloor);

    var hullPortWall = new pc.Entity('bargeHullPortWall');
    hullPortWall.addComponent('render', { type: 'box' });
    hullPortWall.setLocalScale(42, 4, 0.3);
    hullPortWall.setLocalPosition(0, -1, -3.85);
    hullPortWall.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(hullPortWall);

    var hullStarboardWall = new pc.Entity('bargeHullStarboardWall');
    hullStarboardWall.addComponent('render', { type: 'box' });
    hullStarboardWall.setLocalScale(42, 4, 0.3);
    hullStarboardWall.setLocalPosition(0, -1, 3.85);
    hullStarboardWall.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(hullStarboardWall);

    var hullForeWall = new pc.Entity('bargeHullForeWall');
    hullForeWall.addComponent('render', { type: 'box' });
    hullForeWall.setLocalScale(0.3, 4, 7.4);
    hullForeWall.setLocalPosition(-20.85, -1, 0);
    hullForeWall.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(hullForeWall);

    var hullAftWall = new pc.Entity('bargeHullAftWall');
    hullAftWall.addComponent('render', { type: 'box' });
    hullAftWall.setLocalScale(0.3, 4, 7.4);
    hullAftWall.setLocalPosition(20.85, -1, 0);
    hullAftWall.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(hullAftWall);

    var holdFloor = new pc.Entity('holdFloor');
    holdFloor.addComponent('render', { type: 'box' });
    holdFloor.setLocalScale(40.4, 0.18, 6.9);
    holdFloor.setLocalPosition(0, cargoFillFloorY - 0.09, 0);
    holdFloor.render.meshInstances[0].material = matDeck;
    bargeRoot.addChild(holdFloor);

    var deckPort = new pc.Entity('deckPort');
    deckPort.addComponent('render', { type: 'box' });
    deckPort.setLocalScale(42, 0.12, 0.55);
    deckPort.setLocalPosition(0, 1.05, -3.38);
    deckPort.render.meshInstances[0].material = matDeck;
    bargeRoot.addChild(deckPort);

    var deckStarboard = new pc.Entity('deckStarboard');
    deckStarboard.addComponent('render', { type: 'box' });
    deckStarboard.setLocalScale(42, 0.12, 0.55);
    deckStarboard.setLocalPosition(0, 1.05, 3.38);
    deckStarboard.render.meshInstances[0].material = matDeck;
    bargeRoot.addChild(deckStarboard);

    var deckFore = new pc.Entity('deckFore');
    deckFore.addComponent('render', { type: 'box' });
    deckFore.setLocalScale(1.2, 0.12, 6.7);
    deckFore.setLocalPosition(-20.35, 1.05, 0);
    deckFore.render.meshInstances[0].material = matDeck;
    bargeRoot.addChild(deckFore);

    var deckAft = new pc.Entity('deckAft');
    deckAft.addComponent('render', { type: 'box' });
    deckAft.setLocalScale(1.2, 0.12, 6.7);
    deckAft.setLocalPosition(20.35, 1.05, 0);
    deckAft.render.meshInstances[0].material = matDeck;
    bargeRoot.addChild(deckAft);

    var railPort = new pc.Entity('railPort');
    railPort.addComponent('render', { type: 'box' });
    railPort.setLocalScale(42, 0.35, 0.14);
    railPort.setLocalPosition(0, 1.45, -3.95);
    railPort.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(railPort);

    var railStarboard = new pc.Entity('railStarboard');
    railStarboard.addComponent('render', { type: 'box' });
    railStarboard.setLocalScale(42, 0.35, 0.14);
    railStarboard.setLocalPosition(0, 1.45, 3.95);
    railStarboard.render.meshInstances[0].material = matHull;
    bargeRoot.addChild(railStarboard);

    for (var draftIndex = 0; draftIndex < 8; draftIndex += 1) {
      var draftMark = new pc.Entity('draftMark_' + draftIndex);
      draftMark.addComponent('render', { type: 'box' });
      draftMark.setLocalScale(0.8, 0.04, 0.04);
      draftMark.setLocalPosition(-20.5, -2.5 + (draftIndex * 0.5), -4.02);
      draftMark.render.meshInstances[0].material = matDraftMark;
      bargeRoot.addChild(draftMark);
    }

    var stationDefs = [
      { id: 'FP', label: 'FORE PORT', pos: [-18, 1.35, -3.5], camPos: [-16, 4, -8], camLookAt: [-18, 0.5, -3.5] },
      { id: 'FS', label: 'FORE STARBOARD', pos: [-18, 1.35, 3.5], camPos: [-16, 4, 8], camLookAt: [-18, 0.5, 3.5] },
      { id: 'MP', label: 'MID PORT', pos: [0, 1.35, -3.5], camPos: [2, 4, -8], camLookAt: [0, 0.5, -3.5] },
      { id: 'MS', label: 'MID STARBOARD', pos: [0, 1.35, 3.5], camPos: [2, 4, 8], camLookAt: [0, 0.5, 3.5] },
      { id: 'AP', label: 'AFT PORT', pos: [18, 1.35, -3.5], camPos: [20, 4, -8], camLookAt: [18, 0.5, -3.5] },
      { id: 'AS', label: 'AFT STARBOARD', pos: [18, 1.35, 3.5], camPos: [20, 4, 8], camLookAt: [18, 0.5, 3.5] }
    ];

    var stationEntities = [];
    for (var stationIndex = 0; stationIndex < stationDefs.length; stationIndex += 1) {
      var stationDef = stationDefs[stationIndex];
      var marker = new pc.Entity('station_' + stationDef.id);
      marker.addComponent('render', { type: 'sphere' });
      marker.setLocalScale(0.55, 0.55, 0.55);
      marker.setLocalPosition(stationDef.pos[0], stationDef.pos[1], stationDef.pos[2]);
      marker.render.meshInstances[0].material = matMarker;
      marker.stationData = stationDef;
      marker.tags.add('measurementStation');
      bargeRoot.addChild(marker);
      stationEntities.push(marker);
    }

    var cargoFill = new pc.Entity('cargoFill');
    cargoFill.addComponent('render', { type: 'box' });
    cargoFill.setLocalScale(hullInnerLength, 0.001, hullInnerWidth);
    cargoFill.setLocalPosition(0, cargoFillFloorY, 0);
    cargoFill.render.meshInstances[0].material = matCargoFill;
    cargoFill.enabled = false;
    bargeRoot.addChild(cargoFill);

    var cargoRidgeDefs = [
      { x: -11, z: -1.4, width: 10, depth: 2.1, ratio: 0.14 },
      { x: 0, z: 0, width: 14, depth: 2.6, ratio: 0.2 },
      { x: 11, z: 1.3, width: 10, depth: 2.1, ratio: 0.13 }
    ];
    var cargoRidges = [];
    for (var ridgeIndex = 0; ridgeIndex < cargoRidgeDefs.length; ridgeIndex += 1) {
      var ridgeDef = cargoRidgeDefs[ridgeIndex];
      var cargoRidge = new pc.Entity('cargoRidge_' + ridgeIndex);
      cargoRidge.addComponent('render', { type: 'box' });
      cargoRidge.setLocalScale(ridgeDef.width, 0.001, ridgeDef.depth);
      cargoRidge.setLocalPosition(ridgeDef.x, cargoFillFloorY, ridgeDef.z);
      cargoRidge.render.meshInstances[0].material = matCargoFill;
      cargoRidge.enabled = false;
      bargeRoot.addChild(cargoRidge);
      cargoRidges.push(cargoRidge);
    }

    var scanBeam = new pc.Entity('scanBeam');
    scanBeam.addComponent('render', { type: 'plane' });
    scanBeam.setLocalScale(8, 1, 0.15);
    scanBeam.setLocalEulerAngles(-90, 0, 0);
    scanBeam.setLocalPosition(-21, 1.5, 0);
    scanBeam.render.meshInstances[0].material = matScanBeam;
    scanBeam.enabled = false;
    bargeRoot.addChild(scanBeam);

    var scanHullLine = new pc.Entity('scanHullLine');
    scanHullLine.addComponent('render', { type: 'box' });
    scanHullLine.setLocalScale(0.15, 4, 0.05);
    scanHullLine.setLocalPosition(-21, -0.2, -4.02);
    scanHullLine.render.meshInstances[0].material = matScanBeam;
    scanHullLine.enabled = false;
    bargeRoot.addChild(scanHullLine);

    var craneRoot = new pc.Entity('dockCrane');
    craneRoot.setPosition(craneBasePosition.x, craneBasePosition.y, craneBasePosition.z);
    worldRoot.addChild(craneRoot);

    var cranePedestal = new pc.Entity('cranePedestal');
    cranePedestal.addComponent('render', { type: 'cylinder' });
    cranePedestal.setLocalScale(1.8, 2.3, 1.8);
    cranePedestal.setLocalPosition(0, 1.15, 0);
    cranePedestal.render.meshInstances[0].material = matCrane;
    craneRoot.addChild(cranePedestal);

    var craneBody = new pc.Entity('craneBody');
    craneBody.addComponent('render', { type: 'box' });
    craneBody.setLocalScale(3.6, 1.2, 2.4);
    craneBody.setLocalPosition(0.2, 3.1, 0.2);
    craneBody.render.meshInstances[0].material = matCraneAccent;
    craneRoot.addChild(craneBody);

    var craneMast = new pc.Entity('craneMast');
    craneMast.addComponent('render', { type: 'box' });
    craneMast.setLocalScale(0.65, 6.4, 0.65);
    craneMast.setLocalPosition(0, 6.1, 0);
    craneMast.render.meshInstances[0].material = matCrane;
    craneRoot.addChild(craneMast);

    var craneCounter = new pc.Entity('craneCounter');
    craneCounter.addComponent('render', { type: 'box' });
    craneCounter.setLocalScale(2.4, 0.6, 1.6);
    craneCounter.setLocalPosition(-1.2, 8.9, 0);
    craneCounter.render.meshInstances[0].material = matCrane;
    craneRoot.addChild(craneCounter);

    var craneSlew = new pc.Entity('craneSlew');
    craneSlew.setLocalPosition(0, 8.9, 0);
    craneRoot.addChild(craneSlew);

    var craneBoomPivot = new pc.Entity('craneBoomPivot');
    craneSlew.addChild(craneBoomPivot);

    var craneBoom = new pc.Entity('craneBoom');
    craneBoom.addComponent('render', { type: 'box' });
    craneBoom.setLocalScale(16.5, 0.35, 0.5);
    craneBoom.setLocalPosition(8.25, 0, 0);
    craneBoom.render.meshInstances[0].material = matCraneAccent;
    craneBoomPivot.addChild(craneBoom);

    var craneCableRig = new pc.Entity('craneCableRig');
    craneCableRig.setLocalPosition(15.9, 0, 0);
    craneBoomPivot.addChild(craneCableRig);

    var craneCable = new pc.Entity('craneCable');
    craneCable.addComponent('render', { type: 'box' });
    craneCable.setLocalScale(0.08, 4.4, 0.08);
    craneCable.setLocalPosition(0, -2.2, 0);
    craneCable.render.meshInstances[0].material = matCable;
    craneCableRig.addChild(craneCable);

    var craneHook = new pc.Entity('craneHook');
    craneHook.addComponent('render', { type: 'box' });
    craneHook.setLocalScale(0.5, 0.5, 0.5);
    craneHook.setLocalPosition(0, -4.7, 0);
    craneHook.render.meshInstances[0].material = matCrane;
    craneCableRig.addChild(craneHook);

    var loadTargetStem = new pc.Entity('loadTargetStem');
    loadTargetStem.addComponent('render', { type: 'box' });
    loadTargetStem.setLocalScale(0.18, 1.4, 0.18);
    loadTargetStem.setLocalPosition(0, 1.2, 0);
    loadTargetStem.render.meshInstances[0].material = matDataLink;
    loadTargetStem.enabled = false;
    bargeRoot.addChild(loadTargetStem);

    var loadTargetCap = new pc.Entity('loadTargetCap');
    loadTargetCap.addComponent('render', { type: 'box' });
    loadTargetCap.setLocalScale(1.5, 0.06, 1.2);
    loadTargetCap.setLocalPosition(0, 1.95, 0);
    loadTargetCap.render.meshInstances[0].material = matDataLink;
    loadTargetCap.enabled = false;
    bargeRoot.addChild(loadTargetCap);

    var craneTransferBeam = new pc.Entity('craneTransferBeam');
    craneTransferBeam.addComponent('render', { type: 'box' });
    craneTransferBeam.setLocalScale(0.08, 0.08, 1);
    craneTransferBeam.render.meshInstances[0].material = matDataLink;
    craneTransferBeam.enabled = false;
    worldRoot.addChild(craneTransferBeam);

    /* ── Crane material stream (aggregate pour) ── */
    var matAggregateStream = new pc.StandardMaterial();
    matAggregateStream.diffuse = new pc.Color(0.42, 0.35, 0.24);
    matAggregateStream.emissive = new pc.Color(0.12, 0.09, 0.04);
    matAggregateStream.emissiveIntensity = 0.3;
    matAggregateStream.opacity = 0.72;
    matAggregateStream.blendType = pc.BLEND_NORMAL;
    matAggregateStream.update();

    var matSplash = new pc.StandardMaterial();
    matSplash.diffuse = new pc.Color(0.48, 0.40, 0.28);
    matSplash.emissive = new pc.Color(0.15, 0.11, 0.05);
    matSplash.emissiveIntensity = 0.4;
    matSplash.opacity = 0.55;
    matSplash.blendType = pc.BLEND_NORMAL;
    matSplash.update();

    var craneStream = new pc.Entity('craneStream');
    craneStream.addComponent('render', { type: 'box' });
    craneStream.render.meshInstances[0].material = matAggregateStream;
    craneStream.enabled = false;
    worldRoot.addChild(craneStream);

    var craneStreamInner = new pc.Entity('craneStreamInner');
    craneStreamInner.addComponent('render', { type: 'box' });
    craneStreamInner.render.meshInstances[0].material = matAggregateStream;
    craneStreamInner.enabled = false;
    worldRoot.addChild(craneStreamInner);

    var splashCloud = new pc.Entity('splashCloud');
    splashCloud.addComponent('render', { type: 'sphere' });
    splashCloud.render.meshInstances[0].material = matSplash;
    splashCloud.enabled = false;
    worldRoot.addChild(splashCloud);

    /* ── Falling aggregate particles ── */
    var aggregateParticles = [];
    var matParticle = new pc.StandardMaterial();
    matParticle.diffuse = new pc.Color(0.38, 0.32, 0.22);
    matParticle.emissive = new pc.Color(0.10, 0.07, 0.03);
    matParticle.emissiveIntensity = 0.2;
    matParticle.update();

    for (var particleIdx = 0; particleIdx < 12; particleIdx += 1) {
      var particle = new pc.Entity('aggParticle_' + particleIdx);
      particle.addComponent('render', { type: 'box' });
      var pSize = 0.12 + Math.random() * 0.18;
      particle.setLocalScale(pSize, pSize, pSize);
      particle.render.meshInstances[0].material = matParticle;
      particle.enabled = false;
      worldRoot.addChild(particle);
      aggregateParticles.push({
        entity: particle,
        phase: (particleIdx / 12) * Math.PI * 2,
        speed: 3.5 + Math.random() * 2.5,
        offsetX: (Math.random() - 0.5) * 0.5,
        offsetZ: (Math.random() - 0.5) * 0.5
      });
    }

    /* ── Enhanced scan beam visuals ── */
    var scanBeamFan = new pc.Entity('scanBeamFan');
    scanBeamFan.addComponent('render', { type: 'plane' });
    scanBeamFan.setLocalScale(0.2, 1, 6);
    scanBeamFan.setLocalEulerAngles(0, 0, 0);
    scanBeamFan.render.meshInstances[0].material = matScanBeam;
    scanBeamFan.enabled = false;
    bargeRoot.addChild(scanBeamFan);

    var scanHullLineStarboard = new pc.Entity('scanHullLineStarboard');
    scanHullLineStarboard.addComponent('render', { type: 'box' });
    scanHullLineStarboard.setLocalScale(0.15, 4, 0.05);
    scanHullLineStarboard.setLocalPosition(-21, -0.2, 4.02);
    scanHullLineStarboard.render.meshInstances[0].material = matScanBeam;
    scanHullLineStarboard.enabled = false;
    bargeRoot.addChild(scanHullLineStarboard);

    var scanGroundLine = new pc.Entity('scanGroundLine');
    scanGroundLine.addComponent('render', { type: 'box' });
    scanGroundLine.setLocalScale(0.12, 0.06, 8.2);
    scanGroundLine.setLocalPosition(-21, -0.85, 0);
    scanGroundLine.render.meshInstances[0].material = matScanBeam;
    scanGroundLine.enabled = false;
    bargeRoot.addChild(scanGroundLine);

    var matStationFlash = new pc.StandardMaterial();
    matStationFlash.diffuse = new pc.Color(0.95, 1, 1);
    matStationFlash.emissive = new pc.Color(0.04, 0.85, 0.95);
    matStationFlash.emissiveIntensity = 2.5;
    matStationFlash.update();

    var stationFlashRings = [];
    for (var flashIdx = 0; flashIdx < stationDefs.length; flashIdx += 1) {
      var flashRing = new pc.Entity('stationFlash_' + flashIdx);
      flashRing.addComponent('render', { type: 'cylinder' });
      flashRing.setLocalScale(0.01, 0.04, 0.01);
      flashRing.setLocalPosition(stationDefs[flashIdx].pos[0], stationDefs[flashIdx].pos[1], stationDefs[flashIdx].pos[2]);
      flashRing.render.meshInstances[0].material = matStationFlash;
      flashRing.enabled = false;
      bargeRoot.addChild(flashRing);
      stationFlashRings.push(flashRing);
    }

    /* ── LiDAR sensor hubs (elevated sensor units that fire beams down) ── */
    var matSensorHub = new pc.StandardMaterial();
    matSensorHub.diffuse = new pc.Color(0.12, 0.14, 0.18);
    matSensorHub.emissive = new pc.Color(0.02, 0.35, 0.42);
    matSensorHub.emissiveIntensity = 0.8;
    matSensorHub.metalness = 0.6;
    matSensorHub.update();

    var matSensorLens = new pc.StandardMaterial();
    matSensorLens.diffuse = new pc.Color(0.04, 0.8, 0.9);
    matSensorLens.emissive = new pc.Color(0.04, 0.7, 0.8);
    matSensorLens.emissiveIntensity = 1.8;
    matSensorLens.update();

    var lidarSensorHeight = 8.5;
    var lidarSensorDefs = [
      { id: 'FORE', x: -18, z: 0, stationPair: ['FP', 'FS'] },
      { id: 'MID',  x:   0, z: 0, stationPair: ['MP', 'MS'] },
      { id: 'AFT',  x:  18, z: 0, stationPair: ['AP', 'AS'] }
    ];
    var lidarSensorEntities = [];

    for (var sensorIdx = 0; sensorIdx < lidarSensorDefs.length; sensorIdx += 1) {
      var sensorDef = lidarSensorDefs[sensorIdx];

      var sensorHub = new pc.Entity('lidarHub_' + sensorDef.id);
      sensorHub.addComponent('render', { type: 'box' });
      sensorHub.setLocalScale(1.0, 0.5, 0.8);
      sensorHub.setLocalPosition(sensorDef.x, lidarSensorHeight, sensorDef.z);
      sensorHub.render.meshInstances[0].material = matSensorHub;
      bargeRoot.addChild(sensorHub);

      var sensorLens = new pc.Entity('lidarLens_' + sensorDef.id);
      sensorLens.addComponent('render', { type: 'sphere' });
      sensorLens.setLocalScale(0.25, 0.12, 0.25);
      sensorLens.setLocalPosition(sensorDef.x, lidarSensorHeight - 0.3, sensorDef.z);
      sensorLens.render.meshInstances[0].material = matSensorLens;
      bargeRoot.addChild(sensorLens);

      var sensorPole = new pc.Entity('lidarPole_' + sensorDef.id);
      sensorPole.addComponent('render', { type: 'box' });
      sensorPole.setLocalScale(0.12, lidarSensorHeight - 1.35, 0.12);
      sensorPole.setLocalPosition(sensorDef.x, (lidarSensorHeight + 1.35) / 2, sensorDef.z);
      sensorPole.render.meshInstances[0].material = matCrane;
      bargeRoot.addChild(sensorPole);

      lidarSensorEntities.push({
        def: sensorDef,
        hub: sensorHub,
        lens: sensorLens
      });
    }

    /* Barge hydrostatic constants for displacement calculation */
    var bargeLength = 42;
    var bargeBeam = 8;
    var waterplaneArea = bargeLength * bargeBeam;
    var waterDensityFresh = 62.3;
    var lbsPerLongTon = 2240;

    /* LiDAR beam color for renderLine */
    var lidarBeamColor = new pc.Color(0.04, 0.82, 0.92, 1);
    var lidarBeamColorDim = new pc.Color(0.02, 0.45, 0.52, 0.5);
    var lidarBeamColorGreen = new pc.Color(0.1, 0.95, 0.4, 1);

    var cameraEntity = new pc.Entity('camera');
    cameraEntity.addComponent('camera', {
      clearColor: new pc.Color(0.03, 0.04, 0.08),
      nearClip: 0.1,
      farClip: 500,
      fov: 55
    });
    cameraEntity.setPosition(0, 18, 42);
    cameraEntity.lookAt(new pc.Vec3(0, 1, 0));
    worldRoot.addChild(cameraEntity);

    var CameraController = pc.createScript('cameraController');

    CameraController.prototype.initialize = function () {
      this.currentView = 'orbit';
      this.prevView = 'orbit';
      this.activeStationIdx = -1;

      this.transitioning = false;
      this.transitionDuration = 1.2;
      this.transitionElapsed = 0;
      this.startPos = new pc.Vec3();
      this.startRot = new pc.Quat();
      this.targetPos = new pc.Vec3();
      this.targetLookAt = new pc.Vec3();
      this.targetRot = new pc.Quat();

      this.orbitTarget = new pc.Vec3(0, 1, 0);
      this.orbitYaw = 0;
      this.orbitPitch = 22;
      this.orbitDistance = 45;
      this.orbitMinDistance = 20;
      this.orbitMaxDistance = 90;
      this.orbitMinPitch = 5;
      this.orbitMaxPitch = 75;

      this.draggingOrbit = false;
      this.panningLocked = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.lockedLookAt = new pc.Vec3(0, 1, 0);

      this.fpActive = false;
      this.fpPending = false;
      this.pointerLocked = false;
      this.fpMouseDragging = false;
      this.fpYaw = 0;
      this.fpPitch = 0;
      this.fpSpeed = 4;
      this.fpPos = new pc.Vec3(-20, 2.7, 0);
      this.keysDown = {};

      this.viewPresets = {
        orbit: { pos: [0, 18, 42], lookAt: [0, 1, 0] },
        overhead: { pos: [0, 65, 0.1], lookAt: [0, 0, 0] },
        side: { pos: [-60, 5, 0], lookAt: [0, 1, 0] },
        fore: { pos: [-28, 6, 0], lookAt: [10, 2, 0] },
        aft: { pos: [28, 6, 0], lookAt: [-10, 2, 0] }
      };

      this._bindMouse();
      this._bindKeyboard();
      this._bindUiButtons();
      this._applyOrbit();
      this._updateToolbarUI('orbit');
      window.cameraController = this;
    };

    CameraController.prototype._bindUiButtons = function () {
      var self = this;
      document.querySelectorAll('.cam-btn[data-cam]').forEach(function (button) {
        button.addEventListener('click', function () {
          self.goToView(button.getAttribute('data-cam'));
        });
      });

      var resetCam = document.getElementById('btnResetCam');
      if (resetCam) {
        resetCam.addEventListener('click', function () {
          self.goToView('orbit');
        });
      }

      var fpEnter = document.getElementById('fpEnterBtn');
      if (fpEnter) {
        fpEnter.addEventListener('click', function () {
          self.activateFirstPerson();
        });
      }

      var prevBtn = document.getElementById('stationPrevBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          self.prevStation();
        });
      }

      var nextBtn = document.getElementById('stationNextBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          self.nextStation();
        });
      }

      var closeBtn = document.getElementById('stationCloseBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          self.hideStationCard();
          self.goToView(self.prevView || 'orbit');
        });
      }
    };

    CameraController.prototype._bindMouse = function () {
      var self = this;

      canvas.addEventListener('mousedown', function (event) {
        if (self.fpActive) {
          if (!self.pointerLocked) {
            self.fpMouseDragging = true;
            self.lastMouseX = event.clientX;
            self.lastMouseY = event.clientY;
          }
          return;
        }

        if (self.transitioning) {
          return;
        }

        self.lastMouseX = event.clientX;
        self.lastMouseY = event.clientY;

        if (self.currentView === 'orbit' && event.button === 0) {
          self.draggingOrbit = true;
        } else if (self.currentView !== 'orbit' && self.currentView !== 'fp' && event.button === 0) {
          self.panningLocked = true;
        }
      });

      canvas.addEventListener('mouseup', function () {
        self.draggingOrbit = false;
        self.panningLocked = false;
        self.fpMouseDragging = false;
      });

      canvas.addEventListener('mouseleave', function () {
        self.draggingOrbit = false;
        self.panningLocked = false;
        self.fpMouseDragging = false;
      });

      canvas.addEventListener('mousemove', function (event) {
        var dx = event.clientX - self.lastMouseX;
        var dy = event.clientY - self.lastMouseY;

        if (self.fpActive && (self.pointerLocked || self.fpMouseDragging)) {
          var lookDx = self.pointerLocked ? event.movementX : dx;
          var lookDy = self.pointerLocked ? event.movementY : dy;
          self.fpYaw -= lookDx * 0.15;
          self.fpPitch = clamp(self.fpPitch - lookDy * 0.15, -80, 80);
          self.lastMouseX = event.clientX;
          self.lastMouseY = event.clientY;
          return;
        }

        if (self.draggingOrbit && self.currentView === 'orbit') {
          self.orbitYaw -= dx * 0.35;
          self.orbitPitch = clamp(self.orbitPitch + dy * 0.25, self.orbitMinPitch, self.orbitMaxPitch);
        } else if (self.panningLocked && self.currentView !== 'orbit' && self.currentView !== 'fp') {
          self._panLockedView(dx, dy);
        }

        self.lastMouseX = event.clientX;
        self.lastMouseY = event.clientY;
      });

      canvas.addEventListener('wheel', function (event) {
        if (self.fpActive) {
          return;
        }

        if (self.currentView === 'orbit') {
          self.orbitDistance = clamp(self.orbitDistance + event.deltaY * 0.05, self.orbitMinDistance, self.orbitMaxDistance);
        } else if (self.currentView !== 'fp') {
          var forward = self.entity.forward.clone();
          forward.mulScalar(-event.deltaY * 0.02);
          var newPos = self.entity.getPosition().clone().add(forward);
          var newLookAt = self.lockedLookAt.clone().add(forward);
          self.entity.setPosition(newPos);
          self.lockedLookAt.copy(newLookAt);
          self.entity.lookAt(self.lockedLookAt);
        }

        event.preventDefault();
      }, { passive: false });

      canvas.addEventListener('click', function (event) {
        if (self.fpActive || self.transitioning) {
          return;
        }

        self._handleStationClick(event);
      });

      document.addEventListener('pointerlockchange', function () {
        self.pointerLocked = document.pointerLockElement === canvas;
      });
    };

    CameraController.prototype._bindKeyboard = function () {
      var self = this;

      window.addEventListener('keydown', function (event) {
        self.keysDown[event.code] = true;

        if (event.code === 'Digit1') self.goToView('orbit');
        if (event.code === 'Digit2') self.goToView('overhead');
        if (event.code === 'Digit3') self.goToView('side');
        if (event.code === 'Digit4') self.goToView('fore');
        if (event.code === 'Digit5') self.goToView('aft');
        if (event.code === 'Digit6') self.goToView('fp');
        if (event.code === 'Digit7') self.cycleStation();

        if (event.code === 'Escape' && (self.fpActive || self.fpPending)) {
          self.exitFirstPerson(true);
        }
      });

      window.addEventListener('keyup', function (event) {
        self.keysDown[event.code] = false;
      });
    };

    CameraController.prototype._panLockedView = function (dx, dy) {
      var move = new pc.Vec3();
      move.add(this.entity.right.clone().mulScalar(-dx * 0.03));

      if (this.currentView === 'overhead') {
        var flatForward = this.entity.forward.clone();
        flatForward.y = 0;
        if (flatForward.lengthSq() > 0) {
          flatForward.normalize();
          move.add(flatForward.mulScalar(dy * 0.03));
        }
      } else {
        move.add(new pc.Vec3(0, dy * 0.03, 0));
      }

      this.lockedLookAt.add(move);
      this.entity.setPosition(this.entity.getPosition().clone().add(move));
      this.entity.lookAt(this.lockedLookAt);
    };

    CameraController.prototype._startTransition = function (pos, lookAt) {
      this.startPos.copy(this.entity.getPosition());
      this.startRot.copy(this.entity.getRotation());
      this.targetPos.set(pos[0], pos[1], pos[2]);
      this.targetLookAt.set(lookAt[0], lookAt[1], lookAt[2]);

      var probe = new pc.Entity('transitionProbe');
      probe.setPosition(this.targetPos);
      probe.lookAt(this.targetLookAt);
      this.targetRot.copy(probe.getRotation());
      probe.destroy();

      this.lockedLookAt.copy(this.targetLookAt);
      this.transitionElapsed = 0;
      this.transitioning = true;
    };

    CameraController.prototype._applyOrbit = function () {
      var yaw = this.orbitYaw * pc.math.DEG_TO_RAD;
      var pitch = this.orbitPitch * pc.math.DEG_TO_RAD;
      var radius = this.orbitDistance;
      var cosPitch = Math.cos(pitch);

      var x = this.orbitTarget.x + radius * cosPitch * Math.sin(yaw);
      var y = this.orbitTarget.y + radius * Math.sin(pitch);
      var z = this.orbitTarget.z + radius * cosPitch * Math.cos(yaw);

      this.entity.setPosition(x, y, z);
      this.entity.lookAt(this.orbitTarget);
    };

    CameraController.prototype.goToView = function (viewName) {
      if (!isPresentationUnlocked()) {
        return;
      }

      if (viewName === 'station') {
        this.cycleStation();
        return;
      }

      if (viewName === 'fp') {
        this.enterFirstPerson();
        return;
      }

      if (this.fpActive || this.fpPending) {
        this.exitFirstPerson(false);
      }

      var view = this.viewPresets[viewName];
      if (!view) {
        return;
      }

      this.prevView = this.currentView;
      this.currentView = viewName;
      this.activeStationIdx = -1;
      this.hideStationCard();
      this._startTransition(view.pos, view.lookAt);
      if (viewName === 'orbit') {
        this.orbitTarget.set(0, 1, 0);
        this.orbitYaw = 0;
        this.orbitPitch = 22;
        this.orbitDistance = 45;
      }
      this._updateToolbarUI(viewName);
    };

    CameraController.prototype.enterFirstPerson = function () {
      if (!isPresentationUnlocked()) {
        return;
      }

      this.prevView = this.currentView;
      this.currentView = 'fp';
      this.fpPending = true;
      this.fpActive = false;
      this.activeStationIdx = -1;
      this.hideStationCard();
      this._startTransition([-20, 2.7, 0], [0, 2.7, 0]);
      this._updateToolbarUI('fp');

      var instructions = document.getElementById('fpInstructions');
      if (instructions) {
        instructions.style.display = 'block';
      }
    };

    CameraController.prototype.activateFirstPerson = function () {
      this.fpPending = false;
      this.fpActive = true;
      this.fpPos.copy(this.entity.getPosition());
      this.fpPos.y = 2.7;

      var instructions = document.getElementById('fpInstructions');
      if (instructions) {
        instructions.style.display = 'none';
      }

      if (canvas.requestPointerLock) {
        var pointerResult = canvas.requestPointerLock();
        if (pointerResult && typeof pointerResult.catch === 'function') {
          pointerResult.catch(function () {});
        }
      }
    };

    CameraController.prototype.exitFirstPerson = function (returnToOrbit) {
      this.fpPending = false;
      this.fpActive = false;
      this.pointerLocked = false;
      this.fpMouseDragging = false;
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }

      var instructions = document.getElementById('fpInstructions');
      if (instructions) instructions.style.display = 'none';
      var narration = document.getElementById('fpNarration');
      if (narration) narration.style.display = 'none';
      var tooltip = document.getElementById('fpStationTooltip');
      if (tooltip) tooltip.style.opacity = '0';

      if (returnToOrbit !== false) {
        this.goToView('orbit');
      }
    };

    CameraController.prototype.goToStation = function (index) {
      if (!isPresentationUnlocked()) {
        return;
      }

      if (index < 0 || index >= stationDefs.length) {
        return;
      }

      if (this.fpActive || this.fpPending) {
        this.exitFirstPerson(false);
      }

      this.prevView = this.currentView === 'station' ? (this.prevView || 'orbit') : this.currentView;
      this.currentView = 'station';
      this.activeStationIdx = index;

      var station = stationDefs[index];
      this._startTransition(station.camPos, station.camLookAt);
      this.showStationCard(index);
      this._updateToolbarUI('station:' + station.id);
    };

    CameraController.prototype.cycleStation = function () {
      if (!isPresentationUnlocked()) {
        return;
      }

      var nextIndex = this.activeStationIdx + 1;
      if (nextIndex >= stationDefs.length || nextIndex < 0) {
        nextIndex = 0;
      }
      this.goToStation(nextIndex);
    };

    CameraController.prototype.nextStation = function () {
      var nextIndex = this.activeStationIdx + 1;
      if (nextIndex >= stationDefs.length) {
        nextIndex = 0;
      }
      this.goToStation(nextIndex);
    };

    CameraController.prototype.prevStation = function () {
      var nextIndex = this.activeStationIdx - 1;
      if (nextIndex < 0) {
        nextIndex = stationDefs.length - 1;
      }
      this.goToStation(nextIndex);
    };

    CameraController.prototype.hideStationCard = function () {
      var card = document.getElementById('stationCard');
      if (card) {
        card.style.display = 'none';
      }
    };

    CameraController.prototype.showStationCard = function (index) {
      var card = document.getElementById('stationCard');
      if (!card) {
        return;
      }

      var station = stationDefs[index];
      var telemetry = window.simController ? window.simController.telemetry : null;
      var stationValue = telemetry ? telemetry.stations[station.id] : 10.2;
      var stationVisible = window.simController ? window.simController._isStationVisible(station.id) : true;
      var statusText = telemetry ? telemetry.status : 'NOMINAL';

      var title = document.getElementById('stationCardTitle');
      if (title) title.textContent = 'DRAFT STATION - ' + station.label;

      var idEl = document.getElementById('stationCardId');
      if (idEl) idEl.textContent = station.id;

      var readingEl = document.getElementById('stationCardReading');
      if (readingEl) readingEl.textContent = stationVisible ? formatFeet(stationValue) : 'SCANNING...';

      var statusEl = document.getElementById('stationCardStatus');
      if (statusEl) {
        statusEl.textContent = statusText === 'EMERGENCY_STOP' ? 'EMERGENCY_STOP' : 'NOMINAL';
        statusEl.className = 'station-value ' + (statusText === 'EMERGENCY_STOP' ? '' : 'station-ok');
      }

      card.style.display = 'block';
    };

    CameraController.prototype.refreshStationCard = function () {
      if (this.activeStationIdx >= 0 && this.currentView === 'station') {
        this.showStationCard(this.activeStationIdx);
      }
    };

    CameraController.prototype._checkStationProximity = function () {
      var tooltip = document.getElementById('fpStationTooltip');
      if (!tooltip) {
        return;
      }

      var nearby = null;
      var nearestDistance = 3;

      for (var i = 0; i < stationEntities.length; i += 1) {
        var stationPos = stationEntities[i].getPosition();
        var dx = this.fpPos.x - stationPos.x;
        var dz = this.fpPos.z - stationPos.z;
        var distance = Math.sqrt((dx * dx) + (dz * dz));
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearby = stationEntities[i].stationData;
        }
      }

      if (nearby) {
        tooltip.textContent = 'DRAFT STATION ' + nearby.id + ' - click to inspect';
        tooltip.style.opacity = '1';
      } else {
        tooltip.style.opacity = '0';
      }
    };

    CameraController.prototype._updateNarration = function () {
      var narration = document.getElementById('fpNarration');
      if (!narration) {
        return;
      }

      if (!window.freqSimStarted || !this.fpActive) {
        narration.style.display = 'none';
        return;
      }

      narration.style.display = 'block';

      if (this.fpPos.x < -10) {
        narration.textContent = 'FORE STATION: manual operators would read the hull marks here before radioing shore.';
      } else if (this.fpPos.x > 10) {
        narration.textContent = 'AFT STATION: repeated reads across the stern are where manual lag compounds into cargo loss.';
      } else {
        narration.textContent = 'MIDSHIP: FREQ AI keeps this deck clear while telemetry flows directly into the drafting workflow.';
      }
    };

    CameraController.prototype._handleStationClick = function (event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var camera = this.entity.camera;
      var rayStart = camera.screenToWorld(x, y, camera.nearClip);
      var rayEnd = camera.screenToWorld(x, y, camera.farClip);
      var direction = rayEnd.clone().sub(rayStart).normalize();

      for (var i = 0; i < stationEntities.length; i += 1) {
        var center = stationEntities[i].getPosition();
        var toCenter = center.clone().sub(rayStart);
        var projection = toCenter.dot(direction);
        if (projection < 0) {
          continue;
        }

        var closest = rayStart.clone().add(direction.clone().mulScalar(projection));
        var distance = closest.sub(center).length();
        if (distance <= 1.0) {
          this.goToStation(i);
          return;
        }
      }
    };

    CameraController.prototype._updateToolbarUI = function (viewName) {
      var displayName = 'ORBIT VIEW';
      if (viewName === 'overhead') displayName = 'OVERHEAD VIEW';
      if (viewName === 'side') displayName = 'SIDE VIEW';
      if (viewName === 'fore') displayName = 'FORE VIEW';
      if (viewName === 'aft') displayName = 'AFT VIEW';
      if (viewName === 'fp') displayName = 'FIRST PERSON';
      if (viewName.indexOf('station:') === 0) displayName = 'STATION ' + viewName.split(':')[1];

      document.querySelectorAll('.cam-btn[data-cam]').forEach(function (button) {
        button.classList.remove('active');
      });

      if (viewName.indexOf('station:') === 0) {
        var stationButton = document.querySelector('.cam-btn[data-cam="station"]');
        if (stationButton) stationButton.classList.add('active');
      } else {
        var activeButton = document.querySelector('.cam-btn[data-cam="' + viewName + '"]');
        if (activeButton) activeButton.classList.add('active');
      }

      var activeLabel = document.getElementById('activeCameraLabel');
      if (activeLabel) {
        activeLabel.textContent = 'Active: ' + displayName;
      }
    };

    CameraController.prototype.update = function (dt) {
      var normalizedDt = dt > 1 ? dt / 1000 : dt;
      var frameDt = Math.min(normalizedDt, 0.1);

      if (this.transitioning) {
        this.transitionElapsed += frameDt;
        var progress = Math.min(this.transitionElapsed / this.transitionDuration, 1);
        var eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        var position = new pc.Vec3().lerp(this.startPos, this.targetPos, eased);
        var rotation = new pc.Quat().slerp(this.startRot, this.targetRot, eased);
        this.entity.setPosition(position);
        this.entity.setRotation(rotation);

        if (progress >= 1) {
          this.transitioning = false;
          if (this.currentView === 'orbit') {
            this._applyOrbit();
          }
        }
        return;
      }

      if (this.fpActive) {
        var yaw = this.fpYaw * pc.math.DEG_TO_RAD;
        var pitch = this.fpPitch * pc.math.DEG_TO_RAD;
        var forward = new pc.Vec3(Math.sin(yaw), 0, Math.cos(yaw) * -1);
        var right = new pc.Vec3(forward.z * -1, 0, forward.x);
        var move = new pc.Vec3();

        if (this.keysDown.KeyW || this.keysDown.ArrowUp) move.add(forward);
        if (this.keysDown.KeyS || this.keysDown.ArrowDown) move.sub(forward);
        if (this.keysDown.KeyA || this.keysDown.ArrowLeft) move.sub(right);
        if (this.keysDown.KeyD || this.keysDown.ArrowRight) move.add(right);

        if (move.lengthSq() > 0) {
          move.normalize().mulScalar(this.fpSpeed * frameDt);
          this.fpPos.add(move);
        }

        this.fpPos.x = clamp(this.fpPos.x, -21, 21);
        this.fpPos.z = clamp(this.fpPos.z, -4, 4);
        this.fpPos.y = 2.7;

        this.entity.setPosition(this.fpPos);
        var lookTarget = new pc.Vec3(
          this.fpPos.x + Math.sin(yaw) * Math.cos(pitch),
          this.fpPos.y + Math.sin(pitch),
          this.fpPos.z - Math.cos(yaw) * Math.cos(pitch)
        );
        this.entity.lookAt(lookTarget);

        this._checkStationProximity();
        this._updateNarration();
        return;
      }

      if (this.currentView === 'orbit') {
        this._applyOrbit();
      }
    };

    cameraEntity.addComponent('script');
    cameraEntity.script.create('cameraController');

    var SimulationController = pc.createScript('simulationController');

    SimulationController.prototype.initialize = function () {
      this.state = 'IDLE';
      this.presentationAuthorized = false;
      this.paused = false;
      this.phaseIndex = 0;
      this.phaseElapsed = 0;
      this.simElapsed = 0;
      this.currentPhase = 'IDLE';
      this.phaseProgress = 0;
      this.mobFired = false;
      this.mobActive = false;
      this.mobCountdown = 0;
      this.mobClearTimer = null;
      this.scanHitPhase = '';
      this.scanHits = {};
      this.stationPulseTimers = {};
      this.stationReadVisible = {};
      this.scanStatusText = 'LOCKED';

      /* LiDAR raycast state */
      this.lidarActive = false;
      this.lidarDraftValues = {};
      this.lidarMeanDraft = 0;
      this.lidarDisplacement = 0;
      this.lidarBeamTargets = {};
      this.draftingTriggered = false;

      this.maxCargoMass = 1800;
      this.maxCargoFillHeight = cargoFillMaxHeight;
      this.baseDisplacement = 1000;
      this.craneData = {
        status: 'STANDBY',
        signalCode: 'SIG-STBY',
        boomAngle: 34,
        slewBearing: 12,
        hookHeight: 18,
        loadWeight: 0,
        gCode: 'M00 WAIT',
        travelX: craneBasePosition.x
      };

      this.phases = [
        {
          id: 'PRE-SURVEY',
          label: 'Pre-Load Draft Survey',
          duration: 10,
          desc: 'Ghost LiDAR scans all six hull stations to establish the empty-draft baseline before any stone moves.',
          story: 'Ghost LiDAR scans 6 measurement stations on the hull - Fore Port, Fore Starboard, Mid Port, Mid Starboard, Aft Port, Aft Starboard. These baseline readings establish the barge\'s empty displacement and confirm the vessel is within safe operating parameters before loading begins. This replaces a manual walk-on inspection that takes 45+ minutes.'
        },
        {
          id: 'BALLAST-ADJ',
          label: 'Ballast Adjustment',
          duration: 10,
          desc: 'Ballast trims the barge toward level trim and heel so the crane can load against a stable platform.',
          story: 'The SOL system analyzes the pre-survey readings and commands ballast tank adjustments to level the barge. Trim and heel values are driven toward zero. A level barge ensures even weight distribution during loading, preventing dangerous list conditions.'
        },
        {
          id: 'CRANE-POS',
          label: 'Crane Positioning',
          duration: 8,
          desc: 'The Lattice Core converts the draft profile into a crane start vector and moves the crane into its first drop lane.',
          story: 'Based on the corrected draft profile, the Lattice Core generates a G-Code load plan - calculating optimal crane boom angle, slew position, and drop sequence to distribute aggregate evenly across the hold. The crane moves to its calculated start position.'
        },
        {
          id: 'CARGO-LOAD',
          label: 'Cargo Loading and Monitoring',
          duration: 30,
          desc: 'Aggregate fills the hold while SOL continuously redistributes the load to keep the barge stable.',
          story: 'Aggregate material flows into the barge hold. Draft readings increase as the vessel sits lower in the water. The SOL system monitors stability in real-time, adjusting the load distribution to maintain safe trim and heel values. This is where FREQ AI replaces 3+ hours of manual measurement with continuous autonomous monitoring.'
        },
        {
          id: 'TRIM-CORR',
          label: 'Trim Correction',
          duration: 12,
          desc: 'Final ballast and placement corrections bring the loaded barge back to an optimal sailing posture.',
          story: 'With loading complete, the system performs final trim and heel corrections. Small ballast adjustments bring the loaded barge to its optimal sailing configuration. Draft readings stabilize at their final values.'
        },
        {
          id: 'FINAL-SURV',
          label: 'Final Draft Survey',
          duration: 10,
          desc: 'A final Ghost LiDAR sweep verifies the finished load against the plan and seals the record.',
          story: 'Ghost LiDAR performs a final scan of all 6 measurement stations. The readings are compared against the load plan to verify the barge is loaded correctly and within all regulatory parameters. A digital draft survey report is generated automatically - ready for submission to the port authority and cargo owner.'
        }
      ];

      this.initialProfile = {
        stations: { FP: 10.22, FS: 10.20, MP: 10.30, MS: 10.28, AP: 10.38, AS: 10.35 },
        trim: 0.04,
        heel: 0.01,
        gm: 4.85,
        cargoMass: 0,
        freeboard: 5.55,
        status: 'NOMINAL'
      };

      this.phaseProfiles = [
        {
          stations: { FP: 10.28, FS: 10.26, MP: 10.35, MS: 10.34, AP: 10.42, AS: 10.40 },
          trim: 0.03,
          heel: 0.01,
          gm: 4.84,
          cargoMass: 0,
          freeboard: 5.50,
          status: 'SURVEY'
        },
        {
          stations: { FP: 10.32, FS: 10.31, MP: 10.37, MS: 10.36, AP: 10.40, AS: 10.39 },
          trim: 0.01,
          heel: 0.0,
          gm: 4.88,
          cargoMass: 0,
          freeboard: 5.47,
          status: 'BALLAST'
        },
        {
          stations: { FP: 10.35, FS: 10.34, MP: 10.40, MS: 10.39, AP: 10.43, AS: 10.42 },
          trim: 0.02,
          heel: 0.0,
          gm: 4.86,
          cargoMass: 0,
          freeboard: 5.44,
          status: 'POSITIONING'
        },
        {
          stations: { FP: 11.98, FS: 11.92, MP: 12.18, MS: 12.12, AP: 12.44, AS: 12.36 },
          trim: 0.17,
          heel: -0.09,
          gm: 3.62,
          cargoMass: 1800,
          freeboard: 3.85,
          status: 'LOADING'
        },
        {
          stations: { FP: 12.24, FS: 12.20, MP: 12.36, MS: 12.34, AP: 12.48, AS: 12.45 },
          trim: 0.05,
          heel: -0.02,
          gm: 3.84,
          cargoMass: 1800,
          freeboard: 3.72,
          status: 'CORRECTING'
        },
        {
          stations: { FP: 12.36, FS: 12.34, MP: 12.44, MS: 12.43, AP: 12.48, AS: 12.47 },
          trim: 0.02,
          heel: 0.0,
          gm: 3.92,
          cargoMass: 1800,
          freeboard: 3.65,
          status: 'FINAL'
        }
      ];

      this.telemetry = {
        phaseId: 'IDLE',
        phaseLabel: 'Idle',
        stations: {
          FP: this.initialProfile.stations.FP,
          FS: this.initialProfile.stations.FS,
          MP: this.initialProfile.stations.MP,
          MS: this.initialProfile.stations.MS,
          AP: this.initialProfile.stations.AP,
          AS: this.initialProfile.stations.AS
        },
        trim: 0,
        heel: 0,
        gm: this.initialProfile.gm,
        cargoMass: 0,
        cargoFillHeight: 0,
        freeboard: this.initialProfile.freeboard,
        status: 'NOMINAL'
      };

      this.baseAverageDraft = average(this.initialProfile.stations);

      this._bindUi();
      this._applyAuthorizationState();
      this.resetSequence(true);
      window.simController = this;
    };

    SimulationController.prototype._bindUi = function () {
      var self = this;

      function bind(id, handler) {
        var element = document.getElementById(id);
        if (element) {
          element.addEventListener('click', handler);
        }
      }

      bind('btn-start', function () { self.startSequence(); });
      bind('btn-pause', function () { self.pauseSequence(); });
      bind('btn-resume', function () { self.resumeSequence(); });
      bind('btn-reset', function () { self.resetSequence(); });
      bind('mobTriggerBtn', function () { self.triggerManOverboard(); });
      bind('btn-authorize', function () { self.authorizePresentation(); });
    };

    SimulationController.prototype._applyAuthorizationState = function () {
      var locked = !this.presentationAuthorized;

      var consentGate = document.getElementById('simConsentGate');
      if (consentGate) {
        consentGate.style.display = locked ? 'flex' : 'none';
      }

      var startButton = document.getElementById('btn-start');
      if (startButton) {
        startButton.disabled = locked;
      }

      var resetCam = document.getElementById('btnResetCam');
      if (resetCam) {
        resetCam.disabled = locked;
      }

      var mobButton = document.getElementById('mobTriggerBtn');
      if (mobButton) {
        mobButton.disabled = true;
        mobButton.classList.remove('is-enabled');
      }

      document.querySelectorAll('.cam-btn[data-cam]').forEach(function (button) {
        button.disabled = locked;
      });
    };

    SimulationController.prototype.authorizePresentation = function () {
      if (this.presentationAuthorized) {
        return;
      }

      this.presentationAuthorized = true;
      this._applyAuthorizationState();
      this._render(true);
    };

    SimulationController.prototype._resetScanState = function () {
      this.scanStatusText = this.presentationAuthorized ? 'READY' : 'LOCKED';
      for (var i = 0; i < stationDefs.length; i += 1) {
        var stationId = stationDefs[i].id;
        this.stationPulseTimers[stationId] = 0;
        this.stationReadVisible[stationId] = false;
      }
    };

    SimulationController.prototype._revealAllStations = function () {
      for (var i = 0; i < stationDefs.length; i += 1) {
        this.stationReadVisible[stationDefs[i].id] = true;
      }
    };

    SimulationController.prototype._isStationVisible = function (stationId) {
      if (this.state === 'IDLE') {
        return false;
      }

      if (this.currentPhase !== 'PRE-SURVEY') {
        return true;
      }

      return !!this.stationReadVisible[stationId];
    };

    SimulationController.prototype.triggerManOverboard = function () {
      if (this.state !== 'RUNNING' || this.paused || this.mobActive || this.mobFired) {
        return;
      }

      this._triggerManOverboard();
    };

    SimulationController.prototype.startSequence = function () {
      if (!this.presentationAuthorized) {
        return;
      }

      if (this.state === 'RUNNING' && !this.paused) {
        return;
      }

      this.state = 'RUNNING';
      this.paused = false;
      this.phaseIndex = 0;
      this.phaseElapsed = 0;
      this.simElapsed = 0;
      this.currentPhase = this.phases[0].id;
      this.phaseProgress = 0;
      this.mobFired = false;
      this.mobActive = false;
      this.mobCountdown = 0;
      this.scanHitPhase = '';
      this.scanHits = {};
      this._resetScanState();
      this._clearMobUi();
      window.freqSimStarted = true;
      this._setTelemetryFromProfile(this.initialProfile);
      this.telemetry.phaseId = this.phases[0].id;
      this.telemetry.phaseLabel = this.phases[0].label;
      this._render(true);
    };

    SimulationController.prototype.pauseSequence = function () {
      if (this.state !== 'RUNNING' || this.paused || this.mobActive) {
        return;
      }

      this.paused = true;
      this._render(true);
    };

    SimulationController.prototype.resumeSequence = function () {
      if (this.state !== 'RUNNING' || !this.paused) {
        return;
      }

      this.paused = false;
      this._render(true);
    };

    SimulationController.prototype.resetSequence = function (skipCameraReset) {
      this.state = 'IDLE';
      this.paused = false;
      this.phaseIndex = 0;
      this.phaseElapsed = 0;
      this.simElapsed = 0;
      this.currentPhase = 'IDLE';
      this.phaseProgress = 0;
      this.mobFired = false;
      this.mobActive = false;
      this.mobCountdown = 0;
      this.scanHitPhase = '';
      this.scanHits = {};
      this._resetScanState();
      this.lidarActive = false;
      this.lidarDraftValues = {};
      this.lidarMeanDraft = 0;
      this.lidarDisplacement = 0;
      this.lidarBeamTargets = {};
      this.draftingTriggered = false;
      window.freqSimStarted = false;
      this._setTelemetryFromProfile(this.initialProfile);
      this.telemetry.phaseId = 'IDLE';
      this.telemetry.phaseLabel = 'Idle';
      this.telemetry.status = 'NOMINAL';
      this._clearMobUi();
      this._render(true);

      if (!skipCameraReset && window.cameraController) {
        window.cameraController.goToView('orbit');
      }
    };

    SimulationController.prototype._setTelemetryFromProfile = function (profile) {
      var stationKeys = Object.keys(profile.stations);
      for (var i = 0; i < stationKeys.length; i += 1) {
        var key = stationKeys[i];
        this.telemetry.stations[key] = profile.stations[key];
      }

      this.telemetry.trim = profile.trim;
      this.telemetry.heel = profile.heel;
      this.telemetry.gm = profile.gm;
      this.telemetry.cargoMass = profile.cargoMass;
      this.telemetry.cargoFillHeight = clamp((profile.cargoMass / this.maxCargoMass) * this.maxCargoFillHeight, 0, this.maxCargoFillHeight);
      this.telemetry.freeboard = profile.freeboard;
      this.telemetry.status = profile.status;
    };

    SimulationController.prototype._mixProfile = function (fromProfile, toProfile, progress) {
      if (this.paused || this.mobActive) {
        return;
      }

      var wobbleScale = this.phaseIndex === 3 ? 0.04 : this.phaseIndex < 3 ? 0.025 : 0.012;
      if (this.phaseIndex === 5) {
        wobbleScale = 0.004;
      }

      var stationKeys = Object.keys(this.telemetry.stations);
      for (var i = 0; i < stationKeys.length; i += 1) {
        var key = stationKeys[i];
        var wobble = Math.sin((this.simElapsed * 2.1) + i) * wobbleScale * (1 - (progress * 0.65));
        this.telemetry.stations[key] = lerp(fromProfile.stations[key], toProfile.stations[key], progress) + wobble;
      }

      this.telemetry.trim = lerp(fromProfile.trim, toProfile.trim, progress);
      this.telemetry.heel = lerp(fromProfile.heel, toProfile.heel, progress);
      this.telemetry.gm = lerp(fromProfile.gm, toProfile.gm, progress);
      this.telemetry.cargoMass = lerp(fromProfile.cargoMass, toProfile.cargoMass, progress);
      this.telemetry.cargoFillHeight = clamp((this.telemetry.cargoMass / this.maxCargoMass) * this.maxCargoFillHeight, 0, this.maxCargoFillHeight);
      this.telemetry.freeboard = lerp(fromProfile.freeboard, toProfile.freeboard, progress);
      this.telemetry.status = this.mobActive ? 'EMERGENCY_STOP' : toProfile.status;
      this.telemetry.phaseId = this.phases[this.phaseIndex].id;
      this.telemetry.phaseLabel = this.phases[this.phaseIndex].label;
      this.currentPhase = this.phases[this.phaseIndex].id;
      this.phaseProgress = progress;
    };

    SimulationController.prototype._updateCraneData = function (progress) {
      var phaseId = this.currentPhase;
      var data = this.craneData;
      var cargoRatio = this.maxCargoMass === 0 ? 0 : this.telemetry.cargoMass / this.maxCargoMass;

      if (!this.presentationAuthorized) {
        data.status = 'LOCKED';
        data.signalCode = 'M00 WAIT';
        data.boomAngle = 34;
        data.slewBearing = 12;
        data.hookHeight = 18;
        data.loadWeight = 0;
        data.gCode = 'M00 WAIT';
        data.travelX = 0;
        return;
      }

      if (this.mobActive) {
        data.status = 'EMERGENCY_STOP';
        data.signalCode = 'SIG-ESTOP';
        data.gCode = 'M00 STOP';
        data.loadWeight = Math.round(this.telemetry.cargoMass);
        return;
      }

      if (this.state === 'IDLE') {
        data.status = 'STANDBY';
        data.signalCode = 'SIG-STBY';
        data.boomAngle = 34;
        data.slewBearing = 12;
        data.hookHeight = 18;
        data.loadWeight = 0;
        data.gCode = 'M00 READY';
        data.travelX = 0;
        return;
      }

      if (phaseId === 'PRE-SURVEY') {
        data.status = 'SURVEYING';
        data.signalCode = 'SIG-SCAN';
        data.boomAngle = lerp(38, 35, progress);
        data.slewBearing = lerp(14, 18, progress);
        data.hookHeight = lerp(17.5, 16.5, progress);
        data.loadWeight = 0;
        data.travelX = 0;
        data.gCode = 'G04 P1 // SCAN BASELINE';
        return;
      }

      if (phaseId === 'BALLAST-ADJ') {
        data.status = 'BALLAST_READY';
        data.signalCode = 'SIG-BAL';
        data.boomAngle = 35;
        data.slewBearing = 18;
        data.hookHeight = 16.5;
        data.loadWeight = 0;
        data.travelX = 0;
        data.gCode = 'M10 TRIM ' + this.telemetry.trim.toFixed(2);
        return;
      }

      if (phaseId === 'CRANE-POS') {
        data.status = 'POSITIONING';
        data.signalCode = 'SIG-POS';
        data.boomAngle = lerp(35, 28, progress);
        data.slewBearing = lerp(18, 34, progress);
        data.hookHeight = lerp(16.5, 9.5, progress);
        data.loadWeight = 0;
        data.travelX = lerp(-14, craneLaneTargets[0], progress);
        data.gCode = 'G00 X' + data.travelX.toFixed(1) + ' A' + data.slewBearing.toFixed(1) + ' B' + data.boomAngle.toFixed(1) + ' Z' + data.hookHeight.toFixed(1);
        return;
      }

      if (phaseId === 'CARGO-LOAD') {
        var laneFloat = progress * (craneLaneTargets.length - 1);
        var laneIndex = Math.floor(laneFloat);
        var nextLaneIndex = Math.min(craneLaneTargets.length - 1, laneIndex + 1);
        var laneProgress = laneFloat - laneIndex;
        data.status = 'LOADING';
        data.signalCode = 'SIG-LOAD';
        data.boomAngle = lerp(29, 25, progress) + (Math.sin(progress * Math.PI * 2) * 0.8);
        data.slewBearing = lerp(24, 42, progress) + (Math.sin(progress * Math.PI * 1.6) * 3.2);
        data.hookHeight = lerp(10.6, 7.4, progress) + (Math.sin(progress * Math.PI * 4) * 0.35);
        data.loadWeight = Math.round(this.telemetry.cargoMass);
        data.travelX = lerp(craneLaneTargets[laneIndex], craneLaneTargets[nextLaneIndex], laneProgress);
        data.gCode = 'G01 X' + data.travelX.toFixed(1) + ' A' + data.slewBearing.toFixed(1) + ' B' + data.boomAngle.toFixed(1) + ' Z' + data.hookHeight.toFixed(1) + ' F450';
        return;
      }

      if (phaseId === 'TRIM-CORR') {
        data.status = 'TRIM_CORR';
        data.signalCode = 'SIG-TRIM';
        data.boomAngle = lerp(26, 30, progress);
        data.slewBearing = lerp(36, 22, progress);
        data.hookHeight = lerp(8.4, 10.5, progress);
        data.loadWeight = Math.round(this.maxCargoMass * clamp(0.92 + (progress * 0.08), 0, 1));
        data.travelX = lerp(6, 0, progress);
        data.gCode = 'G01 X' + data.travelX.toFixed(1) + ' A' + data.slewBearing.toFixed(1) + ' B' + data.boomAngle.toFixed(1) + ' Z' + data.hookHeight.toFixed(1) + ' F220';
        return;
      }

      if (phaseId === 'FINAL-SURV') {
        data.status = 'VERIFYING';
        data.signalCode = 'SIG-VERIFY';
        data.boomAngle = lerp(30, 34, progress);
        data.slewBearing = lerp(22, 16, progress);
        data.hookHeight = lerp(12.5, 16, progress);
        data.loadWeight = Math.round(this.maxCargoMass * clamp(cargoRatio, 0, 1));
        data.travelX = 0;
        data.gCode = 'G04 P1 // FINAL VERIFY';
        return;
      }

      data.status = 'STANDBY';
      data.signalCode = 'SIG-STBY';
      data.boomAngle = 34;
      data.slewBearing = 12;
      data.hookHeight = 18;
      data.loadWeight = 0;
      data.gCode = 'M00 READY';
      data.travelX = 0;
    };

    SimulationController.prototype._updateCargoFill = function (force) {
      if ((this.paused || this.mobActive) && !force) {
        return;
      }

      var fillHeight = this.telemetry.cargoFillHeight || 0;
      if (fillHeight <= 0.01) {
        cargoFill.enabled = false;
        cargoFill.setLocalScale(hullInnerLength, 0.001, hullInnerWidth);
        cargoFill.setLocalPosition(0, cargoFillFloorY, 0);
        for (var ridgeOff = 0; ridgeOff < cargoRidges.length; ridgeOff += 1) {
          cargoRidges[ridgeOff].enabled = false;
        }
        return;
      }

      cargoFill.enabled = true;
      cargoFill.setLocalScale(hullInnerLength, fillHeight, hullInnerWidth);
      cargoFill.setLocalPosition(0, cargoFillFloorY + (fillHeight / 2), 0);

      for (var ridgeIndex = 0; ridgeIndex < cargoRidges.length; ridgeIndex += 1) {
        var ridgeDef = cargoRidgeDefs[ridgeIndex];
        var ridgeHeight = Math.max(0.001, fillHeight * ridgeDef.ratio);
        var ridgeBase = Math.max(cargoFillFloorY, (cargoFillFloorY + fillHeight) - (ridgeHeight * 0.7));
        cargoRidges[ridgeIndex].enabled = fillHeight > 0.2;
        cargoRidges[ridgeIndex].setLocalScale(ridgeDef.width, ridgeHeight, ridgeDef.depth);
        cargoRidges[ridgeIndex].setLocalPosition(ridgeDef.x, ridgeBase + (ridgeHeight / 2), ridgeDef.z);
      }
    };

    SimulationController.prototype._advanceStationPulseTimers = function (delta) {
      for (var i = 0; i < stationDefs.length; i += 1) {
        var stationId = stationDefs[i].id;
        if (this.stationPulseTimers[stationId] > 0) {
          this.stationPulseTimers[stationId] = Math.max(0, this.stationPulseTimers[stationId] - delta);
        }
      }
    };

    SimulationController.prototype._updateScanBeam = function (force) {
      if ((this.paused || this.mobActive) && !force) {
        return;
      }

      var scanActive = this.state === 'RUNNING' &&
        (this.currentPhase === 'PRE-SURVEY' || this.currentPhase === 'FINAL-SURV');
      var scanDots = '.';
      if (this.state === 'RUNNING') {
        var dotCount = (Math.floor(this.simElapsed * 3) % 3) + 1;
        scanDots = new Array(dotCount + 1).join('.');
      }

      if (!scanActive) {
        scanBeam.enabled = false;
        scanHullLine.enabled = false;
        scanHullLineStarboard.enabled = false;
        scanGroundLine.enabled = false;
        scanBeamFan.enabled = false;
        if (this.state === 'RUNNING' && this.currentPhase !== 'PRE-SURVEY') {
          this._revealAllStations();
          this.scanStatusText = this.currentPhase === 'FINAL-SURV' ? 'FINAL SCAN' : 'COMPLETE';
        } else if (this.state === 'COMPLETE') {
          this.scanStatusText = 'VERIFIED';
        } else if (this.state === 'IDLE') {
          this.scanStatusText = this.presentationAuthorized ? 'READY' : 'LOCKED';
        }
        return;
      }

      if (this.scanHitPhase !== this.currentPhase) {
        this.scanHitPhase = this.currentPhase;
        this.scanHits = {};
      }

      var sweep = clamp(this.phaseProgress, 0, 1);
      var scanX = lerp(-21, 21, sweep);

      var beamPulse = 1.0 + Math.sin(this.simElapsed * 8) * 0.3;
      scanBeam.enabled = true;
      scanBeam.setLocalScale(8, 1, 0.15 * beamPulse);
      scanBeam.setLocalPosition(scanX, 1.5, 0);
      scanHullLine.enabled = true;
      scanHullLine.setLocalScale(0.15 * beamPulse, 4, 0.05);
      scanHullLine.setLocalPosition(scanX, -0.2, -4.02);
      scanHullLineStarboard.enabled = true;
      scanHullLineStarboard.setLocalScale(0.15 * beamPulse, 4, 0.05);
      scanHullLineStarboard.setLocalPosition(scanX, -0.2, 4.02);
      scanGroundLine.enabled = true;
      scanGroundLine.setLocalPosition(scanX, -0.85, 0);
      scanBeamFan.enabled = true;
      scanBeamFan.setLocalPosition(scanX, 0.3, 0);
      this.scanStatusText = this.currentPhase === 'FINAL-SURV'
        ? 'FINAL SCAN' + scanDots
        : 'SCANNING' + scanDots;

      for (var i = 0; i < stationDefs.length; i += 1) {
        var station = stationDefs[i];
        if (Math.abs(scanX - station.pos[0]) <= 2.7 && !this.scanHits[station.id]) {
          this.scanHits[station.id] = true;
          this.stationPulseTimers[station.id] = 1.2;
          this.stationReadVisible[station.id] = true;
        }
      }
    };

    SimulationController.prototype._updateCraneScene = function (force) {
      if ((this.paused || this.mobActive) && !force) {
        return;
      }

      craneRoot.setPosition(craneBasePosition.x, craneBasePosition.y, craneBasePosition.z);
      craneSlew.setLocalEulerAngles(0, this.craneData.slewBearing, 0);
      craneBoomPivot.setLocalEulerAngles(0, 0, -this.craneData.boomAngle);
      craneCableRig.setLocalEulerAngles(0, 0, this.craneData.boomAngle);

      var cableLength = clamp(24 - this.craneData.hookHeight, 2.8, 8.6);
      craneCable.setLocalScale(0.08, cableLength, 0.08);
      craneCable.setLocalPosition(0, -(cableLength / 2), 0);
      craneHook.setLocalPosition(0, -cableLength - 0.35, 0);

      var targetVisible = this.presentationAuthorized &&
        (this.state === 'RUNNING' || this.state === 'COMPLETE') &&
        this.currentPhase !== 'PRE-SURVEY' &&
        this.currentPhase !== 'BALLAST-ADJ';
      var targetX = clamp(this.craneData.travelX, -16.5, 16.5);
      var targetY = clamp(1.55 + (this.telemetry.cargoFillHeight * 0.4), 1.55, 2.7);
      var stemHeight = clamp(0.8 + (this.telemetry.cargoFillHeight * 0.5), 0.8, 2.2);

      loadTargetStem.enabled = targetVisible;
      loadTargetCap.enabled = targetVisible;

      if (targetVisible) {
        loadTargetStem.setLocalScale(0.18, stemHeight, 0.18);
        loadTargetStem.setLocalPosition(targetX, cargoFillFloorY + (stemHeight / 2), 0);
        loadTargetCap.setLocalPosition(targetX, targetY, 0);
      }

      var transferActive = this.presentationAuthorized &&
        this.state === 'RUNNING' &&
        !this.mobActive &&
        (this.currentPhase === 'CRANE-POS' ||
          this.currentPhase === 'CARGO-LOAD' ||
          this.currentPhase === 'TRIM-CORR' ||
          this.currentPhase === 'FINAL-SURV');

      if (transferActive && targetVisible) {
        var hookWorld = craneHook.getPosition().clone();
        var targetWorld = loadTargetCap.getPosition().clone();
        var transferVector = targetWorld.clone().sub(hookWorld);
        var transferLength = Math.max(0.01, transferVector.length());
        var beamThickness = 0.05 + (Math.sin(this.simElapsed * 4.2) * 0.008);
        var beamMid = hookWorld.clone().add(targetWorld).mulScalar(0.5);

        craneTransferBeam.enabled = true;
        craneTransferBeam.setPosition(beamMid);
        craneTransferBeam.lookAt(targetWorld);
        craneTransferBeam.setLocalScale(beamThickness, beamThickness, transferLength);
      } else {
        craneTransferBeam.enabled = false;
      }
    };

    SimulationController.prototype._updateWaterline = function (force) {
      if (this.paused && !force) {
        return;
      }

      var draftAverage = average(this.telemetry.stations);
      var rise = clamp((draftAverage - this.baseAverageDraft) * 0.1, 0, 0.85);
      waterline.setPosition(0, -0.48 + rise, 0);
    };

    /* ── Geometric LiDAR raycasts: compute draft from sensor→water distance ── */
    SimulationController.prototype._performLidarRaycasts = function () {
      var scanActive = this.state === 'RUNNING' &&
        (this.currentPhase === 'PRE-SURVEY' || this.currentPhase === 'FINAL-SURV');
      var monitorActive = this.state === 'RUNNING' && !scanActive;

      this.lidarActive = scanActive || monitorActive;

      if (!this.lidarActive) {
        this.lidarMeanDraft = 0;
        this.lidarDisplacement = 0;
        return;
      }

      var bargeWorldY = bargeRoot.getPosition().y;
      var waterSurfaceY = -0.5;
      var totalDraft = 0;
      var stationCount = 0;

      for (var si = 0; si < lidarSensorDefs.length; si += 1) {
        var sDef = lidarSensorDefs[si];
        var sensorWorldY = bargeWorldY + lidarSensorHeight;

        for (var pi = 0; pi < sDef.stationPair.length; pi += 1) {
          var stId = sDef.stationPair[pi];
          var stDef = null;
          for (var di = 0; di < stationDefs.length; di += 1) {
            if (stationDefs[di].id === stId) { stDef = stationDefs[di]; break; }
          }
          if (!stDef) continue;

          var stationWorldY = bargeWorldY + stDef.pos[1];
          var hullDepth = 2.82;
          var draftValue = hullDepth + Math.max(0, waterSurfaceY - (bargeWorldY - hullDepth));
          if (this.stationReadVisible[stId]) {
            draftValue = this.telemetry.stations[stId];
          }

          this.lidarDraftValues[stId] = draftValue;
          this.lidarBeamTargets[stId] = {
            fromY: sensorWorldY,
            toY: stationWorldY
          };

          totalDraft += draftValue;
          stationCount += 1;
        }
      }

      if (stationCount > 0) {
        this.lidarMeanDraft = totalDraft / stationCount;
        this.lidarDisplacement = (waterplaneArea * this.lidarMeanDraft * waterDensityFresh) / lbsPerLongTon;
      }
    };

    /* ── Draw visible LiDAR beams using app.renderLine() ── */
    SimulationController.prototype._drawLidarBeams = function () {
      if (!this.lidarActive || !this.presentationAuthorized) {
        return;
      }

      var scanPhase = this.currentPhase === 'PRE-SURVEY' || this.currentPhase === 'FINAL-SURV';
      var bargePos = bargeRoot.getPosition();

      for (var si = 0; si < lidarSensorDefs.length; si += 1) {
        var sDef = lidarSensorDefs[si];
        var sensorWorldX = bargePos.x + sDef.x;
        var sensorWorldY = bargePos.y + lidarSensorHeight;
        var sensorWorldZ = bargePos.z + sDef.z;

        for (var pi = 0; pi < sDef.stationPair.length; pi += 1) {
          var stId = sDef.stationPair[pi];
          if (!this.stationReadVisible[stId] && scanPhase) continue;

          var stDef = null;
          for (var di = 0; di < stationDefs.length; di += 1) {
            if (stationDefs[di].id === stId) { stDef = stationDefs[di]; break; }
          }
          if (!stDef) continue;

          var stWorldX = bargePos.x + stDef.pos[0];
          var stWorldY = bargePos.y + stDef.pos[1];
          var stWorldZ = bargePos.z + stDef.pos[2];

          var from = new pc.Vec3(sensorWorldX, sensorWorldY, sensorWorldZ);
          var to = new pc.Vec3(stWorldX, stWorldY, stWorldZ);

          var beamColor = this.currentPhase === 'FINAL-SURV' ? lidarBeamColorGreen : lidarBeamColor;
          if (!scanPhase) beamColor = lidarBeamColorDim;

          app.renderLine(from, to, beamColor);
          var from2 = new pc.Vec3(sensorWorldX + 0.03, sensorWorldY, sensorWorldZ);
          var to2 = new pc.Vec3(stWorldX + 0.03, stWorldY, stWorldZ);
          app.renderLine(from2, to2, beamColor);

          if (scanPhase) {
            var waterHit = new pc.Vec3(stWorldX, -0.5, stWorldZ);
            app.renderLine(to, waterHit, lidarBeamColorDim);
          }
        }
      }

      var lensPulse = scanPhase ? (1.2 + Math.sin(this.simElapsed * 6) * 0.8) : 0.6;
      matSensorLens.emissiveIntensity = lensPulse;
      matSensorLens.update();
    };

    /* ── Procedure trigger: auto-start drafting when cargo reaches target ── */
    SimulationController.prototype._checkDraftingTrigger = function () {
      if (this.draftingTriggered) return;
      if (this.currentPhase !== 'CARGO-LOAD') return;
      if (this.telemetry.cargoMass >= this.maxCargoMass * 0.95) {
        this.draftingTriggered = true;
      }
    };

    SimulationController.prototype._updateScene = function (force) {
      if (this.paused && !force) {
        return;
      }

      var draftAverage = average(this.telemetry.stations);
      var sinkAmount = clamp((draftAverage - this.baseAverageDraft) * 0.34, 0, 1.8);
      bargeRoot.setPosition(0, -sinkAmount, 0);

      var heelTilt = clamp(this.telemetry.heel * 8, -1.6, 1.6);
      var trimTilt = clamp(this.telemetry.trim * 6, -1.6, 1.6);
      bargeRoot.setEulerAngles(heelTilt, 0, trimTilt);

      this._updateCargoFill(force);
      this._updateScanBeam(force);
      this._updateCraneScene(force);

      for (var stationIndex = 0; stationIndex < stationEntities.length; stationIndex += 1) {
        var stationId = stationDefs[stationIndex].id;
        var isPulsing = this.stationPulseTimers[stationId] > 0;
        var isFocused = window.cameraController &&
          window.cameraController.currentView === 'station' &&
          window.cameraController.activeStationIdx === stationIndex;
        stationEntities[stationIndex].render.meshInstances[0].material =
          (isPulsing || isFocused) ? matMarkerActive : matMarker;

        /* Station flash ring - expands and fades during pulse */
        if (isPulsing) {
          var pulseRemaining = this.stationPulseTimers[stationId];
          var pulseProgress = 1.0 - (pulseRemaining / 1.2);
          var ringScale = 0.6 + pulseProgress * 2.0;
          stationFlashRings[stationIndex].enabled = true;
          stationFlashRings[stationIndex].setLocalScale(ringScale, 0.04, ringScale);
          stationFlashRings[stationIndex].setLocalPosition(
            stationDefs[stationIndex].pos[0],
            stationDefs[stationIndex].pos[1],
            stationDefs[stationIndex].pos[2]
          );
        } else {
          stationFlashRings[stationIndex].enabled = false;
        }
      }

      /* ── Material stream from crane during CARGO-LOAD ── */
      var streamActive = this.presentationAuthorized &&
        this.state === 'RUNNING' &&
        !this.mobActive &&
        !this.paused &&
        this.currentPhase === 'CARGO-LOAD';

      if (streamActive) {
        var hookPos = craneHook.getPosition();
        var fillTop = cargoFillFloorY + (this.telemetry.cargoFillHeight || 0.1);
        var bargeY = bargeRoot.getPosition().y;
        var streamTop = hookPos.y;
        var streamBottom = bargeY + fillTop + 0.1;
        var streamHeight = Math.max(0.5, streamTop - streamBottom);
        var streamMidY = (streamTop + streamBottom) / 2;
        var wobble = Math.sin(this.simElapsed * 3.5) * 0.15;

        craneStream.enabled = true;
        craneStream.setPosition(hookPos.x + wobble, streamMidY, hookPos.z);
        craneStream.setLocalScale(0.35, streamHeight, 0.35);

        craneStreamInner.enabled = true;
        craneStreamInner.setPosition(hookPos.x - wobble * 0.5, streamMidY + 0.2, hookPos.z + wobble * 0.3);
        craneStreamInner.setLocalScale(0.2, streamHeight * 0.85, 0.2);

        /* Splash cloud at impact point */
        var splashPulse = 0.8 + Math.sin(this.simElapsed * 5.2) * 0.3;
        splashCloud.enabled = true;
        splashCloud.setPosition(hookPos.x + wobble * 0.5, streamBottom + 0.15, hookPos.z);
        splashCloud.setLocalScale(1.4 * splashPulse, 0.5 * splashPulse, 1.4 * splashPulse);

        /* Animate falling particles */
        for (var pIdx = 0; pIdx < aggregateParticles.length; pIdx += 1) {
          var p = aggregateParticles[pIdx];
          p.entity.enabled = true;
          var cyclePos = ((this.simElapsed * p.speed) + p.phase) % (Math.PI * 2);
          var fallT = (cyclePos / (Math.PI * 2));
          var pY = lerp(streamTop, streamBottom, fallT);
          var scatter = fallT * 0.6;
          p.entity.setPosition(
            hookPos.x + p.offsetX * scatter + Math.sin(cyclePos * 2) * 0.1,
            pY,
            hookPos.z + p.offsetZ * scatter + Math.cos(cyclePos * 3) * 0.1
          );
          var tumble = this.simElapsed * p.speed * 180;
          p.entity.setEulerAngles(tumble, tumble * 0.7, tumble * 0.5);
        }
      } else {
        craneStream.enabled = false;
        craneStreamInner.enabled = false;
        splashCloud.enabled = false;
        for (var pOff = 0; pOff < aggregateParticles.length; pOff += 1) {
          aggregateParticles[pOff].entity.enabled = false;
        }
      }

      this._updateWaterline(force);
    };

    SimulationController.prototype._updatePhaseBar = function () {
      var activePhase = this.state === 'IDLE' ? -1 : this.phaseIndex;
      var doneCount = this.state === 'COMPLETE' ? this.phases.length : this.phaseIndex;

      for (var i = 0; i < this.phases.length; i += 1) {
        var dot = document.getElementById('phase-dot-' + i);
        var label = document.getElementById('phase-lbl-' + i);
        if (!dot || !label) {
          continue;
        }

        var isDone = i < doneCount || this.state === 'COMPLETE';
        var isActive = i === activePhase && this.state === 'RUNNING';
        var dotText = dot.querySelector('span');

        dot.style.borderColor = isDone ? '#10b981' : isActive ? '#06b6d4' : '#1e293b';
        dot.style.background = isDone ? '#10b981' : isActive ? 'rgba(6, 182, 212, 0.18)' : 'transparent';
        if (dotText) {
          dotText.style.color = isDone ? '#052e16' : isActive ? '#9bdcf9' : '#64748b';
          dotText.textContent = String(i + 1);
        }

        label.textContent = label.getAttribute('data-short') || label.textContent;
        label.style.color = isDone ? '#10b981' : isActive ? '#9bdcf9' : '#64748b';
      }

      var lines = document.querySelectorAll('#sim-phase-bar .phase-line');
      for (var lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        lines[lineIndex].style.background = lineIndex < doneCount ? '#10b981' : '#1e293b';
      }

      var phaseDesc = document.getElementById('phase-desc');
      if (!phaseDesc) {
        return;
      }

      if (this.state === 'IDLE') {
        phaseDesc.textContent = this.presentationAuthorized
          ? 'Authorized and armed. Start the sequence to begin the Ghost LiDAR survey.'
          : 'Authorize the digital twin to unlock the autonomous loading demonstration.';
      } else if (this.state === 'COMPLETE') {
        phaseDesc.textContent = 'Survey complete. Every phase has been logged, the load is verified, and the digital draft report is ready.';
      } else {
        var phase = this.phases[this.phaseIndex];
        var operationalCue = '';
        if (phase.id === 'PRE-SURVEY') operationalCue = ' The scan beam reveals each station as the baseline packet is assembled.';
        if (phase.id === 'BALLAST-ADJ') operationalCue = ' The twin is trimming the barge toward level before the first drop.';
        if (phase.id === 'CRANE-POS') operationalCue = ' The crane is receiving the first calculated lane target.';
        if (phase.id === 'CARGO-LOAD') operationalCue = ' Watch the target guide move bay-to-bay as the load is redistributed.';
        if (phase.id === 'TRIM-CORR') operationalCue = ' Final corrections settle trim, heel, and GM.';
        if (phase.id === 'FINAL-SURV') operationalCue = ' The verified dispatch packet is being sealed for release.';
        phaseDesc.textContent = 'Phase ' + (this.phaseIndex + 1) + ': ' + phase.label + ' - ' + phase.desc + operationalCue;
      }
    };

    SimulationController.prototype._updateCompletion = function () {
      var completeEl = document.getElementById('sim-complete');
      if (!completeEl) {
        return;
      }

      completeEl.style.display = this.state === 'COMPLETE' ? 'block' : 'none';

      if (this.state !== 'COMPLETE') {
        return;
      }

      var averageDraft = average(this.telemetry.stations);

      var timeEl = document.getElementById('completeTime');
      if (timeEl) timeEl.textContent = formatTime(this.simElapsed);

      var draftEl = document.getElementById('completeDraft');
      if (draftEl) draftEl.textContent = formatFeet(averageDraft);

      var balanceEl = document.getElementById('completeBalance');
      if (balanceEl) {
        balanceEl.textContent = this.telemetry.trim.toFixed(2) + ' ft / ' + this.telemetry.heel.toFixed(2) + ' deg';
      }
    };

    SimulationController.prototype._updateButtons = function () {
      var stateKey = this.paused ? 'PAUSED' : this.state;
      var startButton = document.getElementById('btn-start');
      var pauseButton = document.getElementById('btn-pause');
      var resumeButton = document.getElementById('btn-resume');
      var resetButton = document.getElementById('btn-reset');
      var mobButton = document.getElementById('mobTriggerBtn');

      if (startButton) startButton.style.display = stateKey === 'IDLE' ? '' : 'none';
      if (pauseButton) pauseButton.style.display = stateKey === 'RUNNING' ? '' : 'none';
      if (resumeButton) resumeButton.style.display = stateKey === 'PAUSED' ? '' : 'none';
      if (resetButton) resetButton.style.display = stateKey !== 'IDLE' ? '' : 'none';

      if (mobButton) {
        var mobEnabled = this.presentationAuthorized &&
          stateKey === 'RUNNING' &&
          !this.mobActive &&
          !this.mobFired;
        mobButton.disabled = !mobEnabled;
        mobButton.classList.toggle('is-enabled', mobEnabled);
      }
    };

    SimulationController.prototype._updateStatus = function () {
      var dot = document.getElementById('sim-status-dot');
      var label = document.getElementById('sim-status-label');
      if (!dot || !label) {
        return;
      }

      var stateKey = this.paused ? 'PAUSED' : this.state;
      dot.className = 'status-dot ' + ({
        IDLE: 'idle',
        RUNNING: 'running',
        PAUSED: 'paused',
        COMPLETE: 'complete'
      }[stateKey] || 'idle');

      label.textContent = ({
        IDLE: 'SYSTEM READY',
        RUNNING: this.mobActive ? 'EMERGENCY HOLD ACTIVE' : 'SEQUENCE ACTIVE',
        PAUSED: 'SEQUENCE PAUSED',
        COMPLETE: 'SURVEY COMPLETE'
      }[stateKey] || 'SYSTEM READY');
    };

    SimulationController.prototype._updateTelemetryUi = function () {
      function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      }

      if (this.state === 'IDLE') {
        setText('telPhase', 'IDLE');
        setText('telFp', '--');
        setText('telFs', '--');
        setText('telMp', '--');
        setText('telMs', '--');
        setText('telAp', '--');
        setText('telAs', '--');
        setText('telTrim', '0.00 ft');
        setText('telHeel', '0.00 deg');
        setText('telCargo', '0 t');
        setText('telGm', formatFeet(this.initialProfile.gm));
        setText('telStatus', 'NOMINAL');
        setText('telScan', this.presentationAuthorized ? 'READY' : 'LOCKED');
        setText('telMeanDraft', '--');
        setText('telDisplacement', '--');
        setText('telElapsed', '00:00');
        return;
      }

      function stationText(controller, stationId) {
        return controller._isStationVisible(stationId)
          ? formatFeet(controller.telemetry.stations[stationId])
          : '--';
      }

      setText('telPhase', this.telemetry.phaseId);
      setText('telFp', stationText(this, 'FP'));
      setText('telFs', stationText(this, 'FS'));
      setText('telMp', stationText(this, 'MP'));
      setText('telMs', stationText(this, 'MS'));
      setText('telAp', stationText(this, 'AP'));
      setText('telAs', stationText(this, 'AS'));
      setText('telTrim', formatFeet(this.telemetry.trim));
      setText('telHeel', formatDegrees(this.telemetry.heel));
      setText('telCargo', formatTons(this.telemetry.cargoMass));
      setText('telGm', formatFeet(this.telemetry.gm));
      setText('telStatus', this.telemetry.status === 'EMERGENCY_STOP' ? 'EMERGENCY_STOP' : this.telemetry.status);
      setText('telScan', this.scanStatusText);
      setText('telMeanDraft', this.lidarMeanDraft > 0 ? formatFeet(this.lidarMeanDraft) : '--');
      setText('telDisplacement', this.lidarDisplacement > 0 ? (Math.round(this.lidarDisplacement) + ' LT') : '--');
      setText('telElapsed', formatTime(this.simElapsed));
    };

    SimulationController.prototype._updateOpsUi = function () {
      function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      }

      var title = 'Awaiting Operator Authorization';
      var copy = 'Authorize the scene to begin the autonomous barge drafting demonstration. The Ghost LiDAR system will survey the hull, generate a load plan, and execute the aggregate loading workflow.';
      var scanStatus = 'LOCKED';
      var craneSignal = 'M00 WAIT | LOCKED';
      var loadVector = 'No draft packet released';
      var transferStatus = 'Transfer bus idle';
      var ribbonText = 'Ghost LiDAR locked pending authorization';
      var ribbonColor = '#9bdcf9';
      var ribbonBorder = 'rgba(14, 165, 233, 0.24)';
      var averageDraft = average(this.telemetry.stations);
      var laneLabel = describeLane(this.craneData.travelX);

      if (this.presentationAuthorized && this.state === 'IDLE') {
        title = 'Awaiting Operator Authorization';
        copy = 'Authorize the scene to begin the autonomous barge drafting demonstration. The Ghost LiDAR system will survey the hull, generate a load plan, and execute the aggregate loading workflow.';
        scanStatus = 'READY';
        craneSignal = 'STANDBY';
        loadVector = 'Hold empty | baseline packet queued';
        transferStatus = 'Survey packet queued for release';
        ribbonText = 'Digital twin armed | ready to initiate';
      }

      if (this.state === 'RUNNING') {
        if (this.currentPhase === 'PRE-SURVEY') {
          title = 'Phase 1 \u2014 Pre-Load Draft Survey';
          copy = 'Ghost LiDAR scans 6 hull stations: Fore Port, Fore Starboard, Mid Port, Mid Starboard, Aft Port, Aft Starboard. These baseline readings establish empty displacement and confirm safe operating parameters. Replaces a 45-minute manual walk-on.';
          scanStatus = this.scanStatusText;
          craneSignal = 'BASELINE PACKET';
          loadVector = 'Baseline draft ' + formatFeet(averageDraft) + ' | six stations opening';
          transferStatus = 'Ghost LiDAR registering stations -> baseline packet building';
          ribbonText = 'PRE-SURVEY | Ghost LiDAR acquiring empty-hull baseline';
          ribbonColor = '#9bdcf9';
          ribbonBorder = 'rgba(14, 165, 233, 0.34)';
        } else if (this.currentPhase === 'BALLAST-ADJ') {
          title = 'Phase 2 \u2014 Ballast Adjustment';
          copy = 'The SOL system analyzes pre-survey readings and commands ballast adjustments to level the barge. Trim and heel values drive toward zero for even weight distribution during loading.';
          scanStatus = 'COMPLETE';
          craneSignal = 'BALLAST READY';
          loadVector = 'Trim ' + this.telemetry.trim.toFixed(2) + ' ft | heel ' + this.telemetry.heel.toFixed(2) + ' deg';
          transferStatus = 'Baseline packet locked -> ballast correction running';
          ribbonText = 'BALLAST-ADJ | SOL leveling the vessel before loading';
        } else if (this.currentPhase === 'CRANE-POS') {
          title = 'Phase 3 \u2014 Crane Positioning';
          copy = 'The Lattice Core generates a G-Code load plan \u2014 optimal boom angle, slew position, and drop sequence to distribute aggregate evenly across the hold. The crane moves to start.';
          scanStatus = 'COMPLETE';
          craneSignal = 'G-CODE TRANSMITTED';
          loadVector = 'Lane ' + laneLabel + ' armed at X' + this.craneData.travelX.toFixed(1);
          transferStatus = 'Survey packet transferred -> first drop lane armed';
          ribbonText = 'CRANE-POS | Lattice Core transmitting load geometry';
        } else if (this.currentPhase === 'CARGO-LOAD') {
          title = 'Phase 4 \u2014 Cargo Loading';
          copy = 'Aggregate material fills the barge hold. Draft readings increase as the vessel sits lower. The SOL system monitors stability in real-time, adjusting distribution to maintain safe trim and heel. This replaces 3+ hours of manual measurement.';
          scanStatus = 'COMPLETE';
          craneSignal = 'LIVE LOAD VECTOR';
          loadVector = 'Lane ' + laneLabel + ' | ' + formatTons(this.telemetry.cargoMass) + ' loaded | trim ' + this.telemetry.trim.toFixed(2) + ' ft';
          transferStatus = 'Digital twin distributing load -> lane ' + laneLabel + ' active';
          ribbonText = 'CARGO-LOAD | Aggregate flow active and monitored in real time';
        } else if (this.currentPhase === 'TRIM-CORR') {
          title = 'Phase 5 \u2014 Trim Correction';
          copy = 'Loading complete. Final trim and heel corrections bring the loaded barge to optimal sailing configuration. Draft readings stabilize at final values.';
          scanStatus = 'COMPLETE';
          craneSignal = 'CORRECTION PASS';
          loadVector = 'Final trim ' + this.telemetry.trim.toFixed(2) + ' ft | heel ' + this.telemetry.heel.toFixed(2) + ' deg | GM ' + this.telemetry.gm.toFixed(2) + ' ft';
          transferStatus = 'Correction packet sent -> mid-hold balance pass';
          ribbonText = 'TRIM-CORR | Final balance pass underway';
        } else if (this.currentPhase === 'FINAL-SURV') {
          title = 'Phase 6 \u2014 Final Draft Survey';
          copy = 'Ghost LiDAR performs a final scan of all 6 stations. Readings are compared against the load plan. A digital draft survey report generates automatically \u2014 ready for port authority and cargo owner submission.';
          scanStatus = this.scanStatusText;
          craneSignal = 'VERIFY PACKET';
          loadVector = 'Final draft ' + formatFeet(averageDraft) + ' | load sealed at ' + formatTons(this.telemetry.cargoMass);
          transferStatus = 'Verification packet transferring -> dispatch seal in progress';
          ribbonText = 'FINAL-SURV | Closing survey and regulatory verification';
          ribbonColor = '#9bdcf9';
          ribbonBorder = 'rgba(14, 165, 233, 0.34)';
        }
      }

      if (this.mobActive) {
        title = 'Man Overboard Hold';
        copy = 'The watchdog has frozen the workflow and held the crane at emergency stop.';
        scanStatus = 'PAUSED';
        craneSignal = 'SIG-ESTOP';
        loadVector = 'Load frozen at ' + formatTons(this.telemetry.cargoMass) + ' until all-clear';
        transferStatus = 'Safety hold active -> transfer bus paused';
        ribbonText = 'WATCHDOG STOP | SIG-ESTOP | human detected';
        ribbonColor = '#fecaca';
        ribbonBorder = 'rgba(248, 113, 113, 0.45)';
      }

      if (this.state === 'COMPLETE') {
        title = 'Survey Complete';
        copy = 'Full loading cycle finished. Zero crew deck exposure. All draft readings verified. Regulatory documentation generated. This entire process replaces a 4-hour manual operation.';
        scanStatus = 'VERIFIED';
        craneSignal = 'REPORT READY';
        loadVector = 'Loaded hold sealed at ' + formatTons(this.telemetry.cargoMass) + ' | avg draft ' + formatFeet(averageDraft);
        transferStatus = 'Dispatch packet sealed -> crane returned to standby';
        ribbonText = 'Dispatch packet sealed | final survey verified';
        ribbonColor = '#a7f3d0';
        ribbonBorder = 'rgba(16, 185, 129, 0.35)';
      }

      setText('opsPhaseTitle', title);
      setText('opsPhaseCopy', copy);
      setText('opsScanStatus', scanStatus);
      setText('opsCraneSignal', craneSignal);
      setText('opsLoadVector', loadVector);
      setText('opsTransferStatus', transferStatus);
      setText('opsCraneCommand', this.craneData.gCode);

      var ribbon = document.getElementById('simSignalRibbon');
      if (ribbon) {
        ribbon.textContent = ribbonText;
        ribbon.style.color = ribbonColor;
        ribbon.style.borderColor = ribbonBorder;
      }
    };

    SimulationController.prototype._render = function (force) {
      this._updateCraneData(this.phaseProgress || 0);
      this._performLidarRaycasts();
      this._updateScene(force);
      this._drawLidarBeams();
      this._checkDraftingTrigger();
      this._updateStatus();
      this._updateButtons();
      this._updateTelemetryUi();
      this._updateOpsUi();
      this._updatePhaseBar();
      this._updateCompletion();

      if (window.cameraController) {
        window.cameraController.refreshStationCard();
      }
    };

    SimulationController.prototype._clearMobUi = function () {
      var shell = document.getElementById('freqCanvasShell');
      if (shell) {
        shell.classList.remove('mob-alert');
        shell.classList.remove('all-clear');
      }

      var banner = document.getElementById('mobBanner');
      var countdown = document.getElementById('mobCountdown');
      var clear = document.getElementById('mobAllClear');
      if (banner) banner.style.display = 'none';
      if (countdown) countdown.style.display = 'none';
      if (clear) clear.style.display = 'none';

      if (this.mobClearTimer) {
        window.clearTimeout(this.mobClearTimer);
        this.mobClearTimer = null;
      }
    };

    SimulationController.prototype._triggerManOverboard = function () {
      this.mobFired = true;
      this.mobActive = true;
      this.mobCountdown = 10;
      this.telemetry.status = 'EMERGENCY_STOP';

      var shell = document.getElementById('freqCanvasShell');
      if (shell) shell.classList.add('mob-alert');

      var banner = document.getElementById('mobBanner');
      var countdown = document.getElementById('mobCountdown');
      if (banner) banner.style.display = 'block';
      if (countdown) countdown.style.display = 'block';

      this._updateMobCountdown();
      this._render(true);
    };

    SimulationController.prototype._updateMobCountdown = function () {
      var countdown = document.getElementById('mobCountdown');
      if (!countdown) {
        return;
      }

      countdown.textContent = 'Safety hold: ' + Math.max(0, Math.ceil(this.mobCountdown));
    };

    SimulationController.prototype._finishMobHold = function () {
      this.mobActive = false;
      this.mobCountdown = 0;
      this.telemetry.status = this.phaseProfiles[this.phaseIndex].status;

      var shell = document.getElementById('freqCanvasShell');
      if (shell) {
        shell.classList.remove('mob-alert');
        shell.classList.add('all-clear');
      }

      var banner = document.getElementById('mobBanner');
      var countdown = document.getElementById('mobCountdown');
      var clear = document.getElementById('mobAllClear');
      if (banner) banner.style.display = 'none';
      if (countdown) countdown.style.display = 'none';
      if (clear) clear.style.display = 'block';

      var self = this;
      this.mobClearTimer = window.setTimeout(function () {
        if (shell) shell.classList.remove('all-clear');
        if (clear) clear.style.display = 'none';
        self.mobClearTimer = null;
      }, 1500);

      this._render(true);
    };

    SimulationController.prototype._advancePhaseIfNeeded = function () {
      if (this.phaseElapsed < this.phases[this.phaseIndex].duration) {
        return;
      }

      if (this.phaseIndex >= this.phases.length - 1) {
        this.state = 'COMPLETE';
        this.currentPhase = 'COMPLETE';
        this.phaseProgress = 1;
        this._setTelemetryFromProfile(this.phaseProfiles[this.phaseProfiles.length - 1]);
        this.telemetry.phaseId = 'COMPLETE';
        this.telemetry.phaseLabel = 'Complete';
        this.telemetry.status = 'COMPLETE';
        this._render(true);
        return;
      }

      this.phaseIndex += 1;
      this.phaseElapsed = 0;
      this.currentPhase = this.phases[this.phaseIndex].id;
      this.phaseProgress = 0;
      this.telemetry.phaseId = this.phases[this.phaseIndex].id;
      this.telemetry.phaseLabel = this.phases[this.phaseIndex].label;
      this._render(true);
    };

    SimulationController.prototype.update = function (dt) {
      if (this.state === 'IDLE' || this.state === 'COMPLETE' || this.paused) return;

      var normalizedDt = dt > 1 ? dt / 1000 : dt;
      var safeDt = Math.min(normalizedDt, 0.1);

      if (this.mobActive) {
        this.mobCountdown = Math.max(0, this.mobCountdown - safeDt);
        this._updateMobCountdown();
        if (this.mobCountdown <= 0) {
          this._finishMobHold();
        }
        return;
      }

      this._advanceStationPulseTimers(safeDt);

      var currentPhase = this.phases[this.phaseIndex];
      this.phaseElapsed = Math.min(this.phaseElapsed + safeDt, currentPhase.duration);
      this.simElapsed += safeDt;

      var localProgress = currentPhase.duration === 0 ? 1 : this.phaseElapsed / currentPhase.duration;
      var fromProfile = this.phaseIndex === 0 ? this.initialProfile : this.phaseProfiles[this.phaseIndex - 1];
      var toProfile = this.phaseProfiles[this.phaseIndex];

      this._mixProfile(fromProfile, toProfile, localProgress);

      this._render(false);
      this._advancePhaseIfNeeded();
    };

    var simulationEntity = new pc.Entity('simulationControllerEntity');
    simulationEntity.addComponent('script');
    app.root.addChild(simulationEntity);
    simulationEntity.script.create('simulationController');

    window.freqApp = app;
    window.freqCargoFill = cargoFill;
    window.freqStations = stationEntities;
  });
})();
