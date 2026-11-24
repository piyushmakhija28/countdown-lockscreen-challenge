/**
 * Unit Test Suite for Sprint 4 Batch 4.1: Tri-Modal Sensory Synchronization.
 * Verifies HapticService, FontService, AudioChimeService, ParticleEngine, and SensoryCoordinator.
 *
 * Verifies Micro-Architectural Test Cases:
 * - TC-POS-108: Dynamic Audio Sample Rate Priming
 * - TC-POS-109: Audio Limiter Peak Compression (DynamicsCompressorNode)
 * - TC-POS-110: Confetti Air Drag Deceleration & Terminal Velocity Bound
 * - TC-POS-111: Confetti Lifespan Alpha Decay over 180 frames
 * - TC-POS-114: Canvas Font Readiness Gate (document.fonts.load())
 * - TC-POS-116: Web Locks Victory Alarm Mutex (navigator.locks.request())
 * - TC-POS-120: Tri-Modal Sensory Synchronization (temporal offset delta < 20ms)
 *
 * @module test/unit/test_sensory_immersion_and_audio
 */

import assert from 'node:assert';
import { HapticService } from '../../src/js/services/HapticService.js';
import { FontService } from '../../src/js/services/FontService.js';
import { AudioChimeService } from '../../src/js/services/AudioChimeService.js';
import { ParticleEngine } from '../../src/js/canvas/ParticleEngine.js';
import { SensoryCoordinator } from '../../src/js/services/SensoryCoordinator.js';

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

/**
 * Mock AudioContext factory for headless Node.js testing.
 */
function createMockAudioContext(sampleRate = 48000, initialState = 'suspended') {
  const scheduledOscillators = [];
  const scheduledGains = [];
  let compressorCreated = null;

  class MockParam {
    constructor(val = 0) {
      this.value = val;
    }
    setValueAtTime(val) {
      this.value = val;
    }
    exponentialRampToValueAtTime(val) {
      this.value = val;
    }
  }

  class MockCompressor {
    constructor() {
      this.threshold = new MockParam(-3);
      this.knee = new MockParam(30);
      this.ratio = new MockParam(12);
      this.attack = new MockParam(0.003);
      this.release = new MockParam(0.25);
    }
    connect() {}
    disconnect() {}
  }

  class MockGain {
    constructor() {
      this.gain = new MockParam(1);
    }
    connect() {}
    disconnect() {}
  }

  class MockOscillator {
    constructor() {
      this.frequency = new MockParam(440);
      this.type = 'sine';
      this.started = false;
      this.stopped = false;
      this.onended = null;
    }
    connect() {}
    disconnect() {}
    start() {
      this.started = true;
    }
    stop() {
      this.stopped = true;
      if (typeof this.onended === 'function') {
        this.onended();
      }
    }
  }

  class MockBufferSource {
    constructor() {
      this.buffer = null;
      this.started = false;
    }
    connect() {}
    start() {
      this.started = true;
    }
  }

  return class MockAudioContext {
    constructor() {
      this.sampleRate = sampleRate;
      this.state = initialState;
      this.currentTime = 0.5;
      this.destination = {};
      this.bufferSources = [];
    }

    async resume() {
      this.state = 'running';
    }

    async close() {
      this.state = 'closed';
    }

    createDynamicsCompressor() {
      compressorCreated = new MockCompressor();
      return compressorCreated;
    }

    createGain() {
      const g = new MockGain();
      scheduledGains.push(g);
      return g;
    }

    createOscillator() {
      const o = new MockOscillator();
      scheduledOscillators.push(o);
      return o;
    }

    createBuffer(channels, length, rate) {
      return { channels, length, sampleRate: rate };
    }

    createBufferSource() {
      const src = new MockBufferSource();
      this.bufferSources.push(src);
      return src;
    }

    static get _lastCompressor() {
      return compressorCreated;
    }

    static get _scheduledOscillators() {
      return scheduledOscillators;
    }
  };
}

/**
 * Mock Web Locks API implementation for multi-tab simulation.
 */
function createMockWebLocks() {
  const activeLocks = new Set();

  return {
    locks: {
      async request(name, options, callback) {
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        const ifAvailable = Boolean(options && options.ifAvailable);
        if (activeLocks.has(name)) {
          if (ifAvailable) {
            return callback(null);
          }
          throw new Error('Lock contention blocked');
        }

        activeLocks.add(name);
        try {
          const lockHandle = { name, mode: 'exclusive' };
          return await callback(lockHandle);
        } finally {
          activeLocks.delete(name);
        }
      }
    },
    isLockActive(name) {
      return activeLocks.has(name);
    }
  };
}

console.log('\n--- Running Sprint 4 Batch 4.1 Unit Test Suite ---\n');

// 1. HapticService Tests
it('HapticService: detects support correctly and silent fallbacks when unsupported', () => {
  const unsupportedHaptic = new HapticService(null);
  assert.strictEqual(unsupportedHaptic.isSupported(), false);
  assert.strictEqual(unsupportedHaptic.lightTap(), false);
  assert.strictEqual(unsupportedHaptic.milestonePattern(), false);
  assert.strictEqual(unsupportedHaptic.victoryPattern(), false);
  assert.strictEqual(unsupportedHaptic.cancel(), false);

  const mockNavigator = {
    vibrateHistory: [],
    vibrate(pattern) {
      this.vibrateHistory.push(pattern);
      return true;
    }
  };

  const supportedHaptic = new HapticService(mockNavigator);
  assert.strictEqual(supportedHaptic.isSupported(), true);

  assert.strictEqual(supportedHaptic.lightTap(), true);
  assert.deepStrictEqual(mockNavigator.vibrateHistory[0], 15);

  assert.strictEqual(supportedHaptic.milestonePattern(), true);
  assert.deepStrictEqual(mockNavigator.vibrateHistory[1], [15, 30, 20]);

  assert.strictEqual(supportedHaptic.victoryPattern(), true);
  assert.deepStrictEqual(mockNavigator.vibrateHistory[2], [100, 50, 100, 50, 250]);

  assert.strictEqual(supportedHaptic.cancel(), true);
  assert.strictEqual(mockNavigator.vibrateHistory[3], 0);
});

// 2. FontService Tests (TC-POS-114)
await itAsync('TC-POS-114: FontService preloads fonts and establishes readiness gate', async () => {
  const loadedFonts = [];
  const mockDoc = {
    fonts: {
      ready: Promise.resolve(),
      async load(descriptor) {
        loadedFonts.push(descriptor);
        return [descriptor];
      }
    }
  };

  const fontService = new FontService(mockDoc);
  assert.strictEqual(fontService.isLoaded(), false);

  const result = await fontService.ensureFontsLoaded(['700 72px "JetBrains Mono"', '400 16px "Inter"']);
  assert.strictEqual(result, true);
  assert.strictEqual(fontService.isLoaded(), true);
  assert.strictEqual(loadedFonts.length, 2);
  assert.strictEqual(loadedFonts[0], '700 72px "JetBrains Mono"');
  assert.strictEqual(loadedFonts[1], '400 16px "Inter"');

  // Idempotent secondary call
  const secondResult = await fontService.ensureFontsLoaded();
  assert.strictEqual(secondResult, true);
});

await itAsync('FontService: gracefully handles headless environment lacking document.fonts', async () => {
  const fontService = new FontService(null);
  const result = await fontService.ensureFontsLoaded();
  assert.strictEqual(result, true);
  assert.strictEqual(fontService.isLoaded(), true);
});

// 3. AudioChimeService Tests (TC-POS-108, TC-POS-109, TC-POS-116)
await itAsync('TC-POS-108 & TC-POS-109: AudioChimeService primes dynamic sample rate and attaches peak limiter', async () => {
  const MockAudioCtx = createMockAudioContext(48000, 'suspended');
  const mockWindow = {
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  const mockDoc = {
    visibilityState: 'visible',
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const audioService = new AudioChimeService({
    AudioContextClass: MockAudioCtx,
    window: mockWindow,
    document: mockDoc
  });

  assert.strictEqual(audioService.getState(), 'LOCKED');

  const unlocked = await audioService.unlockAudioContext();
  assert.strictEqual(unlocked, true);
  assert.strictEqual(audioService.getState(), 'RUNNING');

  // Verify TC-POS-109: Limiter node instantiated with threshold -3dB, knee 30, ratio 12
  const limiter = audioService.getLimiterNode();
  assert.ok(limiter !== null, 'DynamicsCompressorNode must be instantiated');
  assert.strictEqual(limiter.threshold.value, -3);
  assert.strictEqual(limiter.knee.value, 30);
  assert.strictEqual(limiter.ratio.value, 12);
  assert.strictEqual(limiter.attack.value, 0.003);
  assert.strictEqual(limiter.release.value, 0.25);

  // Verify playSuccessChime executes without error
  const successPlayed = await audioService.playSuccessChime();
  assert.strictEqual(successPlayed, true);

  // Verify playVictoryChime executes without error
  const victoryPlayed = await audioService.playVictoryChime();
  assert.strictEqual(victoryPlayed, true);

  audioService.dispose();
  assert.strictEqual(audioService.getState(), 'CLOSED');
});

await itAsync('TC-POS-116: AudioChimeService enforces single-instance victory alarm mutex via Web Locks', async () => {
  const MockAudioCtx = createMockAudioContext(44100, 'suspended');
  const mockLocksEnv = createMockWebLocks();

  const tab1Audio = new AudioChimeService({
    AudioContextClass: MockAudioCtx,
    navigator: mockLocksEnv
  });

  const tab2Audio = new AudioChimeService({
    AudioContextClass: MockAudioCtx,
    navigator: mockLocksEnv
  });

  // Tab 1 initiates victory chime with lock holding for 2500ms
  const tab1Promise = tab1Audio.playVictoryChimeWithLock();

  // Tab 2 attempts to claim the lock concurrently while Tab 1 holds it
  const tab2Result = await tab2Audio.playVictoryChimeWithLock();

  // Tab 2 must receive false (suppressed) because Tab 1 holds the non-blocking lock
  assert.strictEqual(tab2Result, false, 'Sibling concurrent tab must suppress chime playback');

  // Await Tab 1 completion
  const tab1Result = await tab1Promise;
  assert.strictEqual(tab1Result, true, 'Active tab acquiring mutex must play victory chime');

  tab1Audio.dispose();
  tab2Audio.dispose();
});

// 4. ParticleEngine Tests (TC-POS-110, TC-POS-111)
it('TC-POS-110 & TC-POS-111: ParticleEngine verifies Structure-of-Arrays drag kinematics and alpha decay', () => {
  const engine = new ParticleEngine(null);
  const buffer = engine.getBuffer();

  assert.strictEqual(buffer.length, 900, 'Contiguous buffer must hold 150 * 6 = 900 floats');

  // Initialize a mock particle manually to inspect kinematics deterministically
  const offset = 0;
  buffer[offset + 0] = 500; // x
  buffer[offset + 1] = 1000; // y
  buffer[offset + 2] = 200; // vx
  buffer[offset + 3] = -400; // vy
  buffer[offset + 4] = 1.0; // alpha
  buffer[offset + 5] = 2; // colorIdx

  const initialSpeed = Math.sqrt(200 * 200 + (-400) * (-400));

  // Run single simulation update step (dt = 0.016s)
  engine.updateStep(0.016);

  const updatedVx = buffer[offset + 2];
  const updatedVy = buffer[offset + 3];
  const updatedAlpha = buffer[offset + 4];
  const updatedSpeed = Math.sqrt(updatedVx * updatedVx + updatedVy * updatedVy);

  // TC-POS-110: Aerodynamic drag deceleration reduces velocity
  assert.ok(updatedSpeed < initialSpeed, 'Velocity must decelerate under aerodynamic drag');
  assert.ok(updatedSpeed <= ParticleEngine.TERMINAL_VELOCITY, 'Speed must remain bounded by terminal velocity');

  // TC-POS-111: Alpha decays monotonically
  assert.ok(updatedAlpha < 1.0, 'Particle alpha must decay monotonically per frame');
  assert.ok(updatedAlpha > 0.0, 'Alpha must remain positive after single frame');

  // Verify multiple steps eventually decay alpha to zero
  for (let step = 0; step < 200; step++) {
    engine.updateStep(0.016);
  }
  assert.strictEqual(buffer[offset + 4], 0.0, 'Alpha must reach 0.0 after full lifespan');
});

it('ParticleEngine: respects prefers-reduced-motion accessibility bypass', () => {
  const mockWindowReduced = {
    matchMedia(query) {
      return { matches: query.includes('prefers-reduced-motion') };
    }
  };

  const engine = new ParticleEngine(mockWindowReduced);
  assert.strictEqual(engine.isReducedMotionActive(), true);

  const mockCtx = { save: () => {}, restore: () => {}, fillRect: () => {} };
  const burstStarted = engine.startBurst(mockCtx, 1170, 2532);
  assert.strictEqual(burstStarted, false, 'startBurst must bypass execution when reduced motion is preferred');
});

// 5. SensoryCoordinator Tests (TC-POS-120)
await itAsync('TC-POS-120: SensoryCoordinator synchronizes visual, audio, and haptic modalities within 20ms', async () => {
  const mockNavigator = {
    vibrateHistory: [],
    vibrate(pattern) {
      this.vibrateHistory.push(pattern);
      return true;
    }
  };
  const mockLocksEnv = createMockWebLocks();
  mockLocksEnv.vibrate = mockNavigator.vibrate.bind(mockNavigator);

  const MockAudioCtx = createMockAudioContext(48000, 'running');
  const audioService = new AudioChimeService({
    AudioContextClass: MockAudioCtx,
    navigator: mockLocksEnv
  });
  await audioService.unlockAudioContext();

  const hapticService = new HapticService(mockNavigator);
  const particleEngine = new ParticleEngine(null);

  const coordinator = new SensoryCoordinator(audioService, hapticService, particleEngine);

  // Test Milestone Feedback Synchronization (< 20ms bound)
  const milestoneResult = await coordinator.triggerMilestoneFeedback('cyber_obsidian');
  assert.strictEqual(milestoneResult.success, true);
  assert.strictEqual(milestoneResult.audioTriggered, true);
  assert.strictEqual(milestoneResult.hapticTriggered, true);
  assert.ok(milestoneResult.jitterMs < 20.0, `Inter-sensory jitter (${milestoneResult.jitterMs}ms) must be strictly < 20ms`);

  // Test Victory Celebration Synchronization
  const mockCtx = { save: () => {}, restore: () => {}, fillRect: () => {} };
  const victoryResult = await coordinator.triggerVictoryCelebration('cyber_obsidian', {
    ctx: mockCtx,
    width: 1170,
    height: 2532
  });
  assert.strictEqual(victoryResult.success, true);
  assert.strictEqual(victoryResult.audioTriggered, true);
  assert.strictEqual(victoryResult.hapticTriggered, true);
  assert.ok(victoryResult.jitterMs < 20.0, `Victory inter-sensory jitter (${victoryResult.jitterMs}ms) must be strictly < 20ms`);

  coordinator.stopCelebration();
  coordinator.dispose();
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
