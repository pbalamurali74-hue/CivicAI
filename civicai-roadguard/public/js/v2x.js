/**
 * CivicAI RoadGuard - Connected Vehicle Alert (C-V2X) & Multi-Bus Verification
 * 
 * Simulates low-latency C-V2X / DSRC Direct Short Range Communications hazard broadcasting
 * to 7 neighboring vehicles within a 350m radius, and demonstrates multi-bus fleet corroboration
 * across BUS-104A, BUS-102, and BUS-103 for eliminating false positives in municipal road surveillance.
 * 
 * NOTE: Explicitly marked as SIMULATED CONNECTED VEHICLE ALERT (PROTOTYPE).
 */

class RoadGuardV2X {
  constructor() {
    this.isBroadcasting = false;
    this.broadcastCount = 0;
    this.activeAlertMessage = 'V2X DSRC / C-V2X STANDBY';
    this.v2xListeners = [];

    // 7 nearby connected vehicles within 350m radius
    this.nearbyFleet = [
      { id: 'TN-09-CB-4821', type: 'Private Sedan', distance: 140, ack: false, latencyMs: 120, status: 'STANDBY' },
      { id: 'TN-01-AX-9102', type: 'Auto-Rickshaw', distance: 210, ack: false, latencyMs: 180, status: 'STANDBY' },
      { id: 'MTC-BUS-102', type: 'MTC Fleet Bus', distance: 240, ack: false, latencyMs: 220, status: 'STANDBY' },
      { id: 'TN-07-EM-0419', type: 'Ambulance 108', distance: 290, ack: false, latencyMs: 260, status: 'STANDBY' },
      { id: 'TN-02-KL-7712', type: 'Delivery Van', distance: 310, ack: false, latencyMs: 310, status: 'STANDBY' },
      { id: 'TN-10-Q-5541', type: 'Two-Wheeler', distance: 330, ack: false, latencyMs: 340, status: 'STANDBY' },
      { id: 'GCC-SAN-12', type: 'Municipal Truck', distance: 350, ack: false, latencyMs: 380, status: 'STANDBY' }
    ];

    // Multi-Vehicle Fleet Consensus Data (SIH PS 26124)
    this.multiFleetConsensus = {
      hazardId: 'HAZARD-ANNA-SALAI-4092',
      primaryVehicle: 'BUS-104A (Originator)',
      totalCrossVerifications: 3,
      aggregateConfidence: '99.2%',
      falsePositiveReduction: '94% (Consensus Threshold Exceeded)',
      fleetPasses: [
        { busId: 'BUS-104A', route: 'Route 70H (Guindy ➔ T. Nagar)', time: 'Just Now (T-0)', conf: '94.8%', status: 'CONFIRMED' },
        { busId: 'BUS-102', route: 'Route 101A (CMBT ➔ Central)', time: '4 mins ago (T-4m)', conf: '96.1%', status: 'VERIFIED' },
        { busId: 'BUS-103', route: 'Route 23C (Adayar ➔ Egmore)', time: '12 mins ago (T-12m)', conf: '98.4%', status: 'VERIFIED' }
      ]
    };
  }

  onUpdate(cb) {
    if (typeof cb === 'function') {
      this.v2xListeners.push(cb);
    }
  }

  notify() {
    this.v2xListeners.forEach(cb => cb({
      isBroadcasting: this.isBroadcasting,
      message: this.activeAlertMessage,
      fleet: this.nearbyFleet,
      consensus: this.multiFleetConsensus
    }));
  }

  /**
   * Determine tailored caution message based on hazard class
   */
  getCauseMessage(hazard) {
    const type = hazard.classKey || hazard.type || 'POTHOLE';
    switch (type) {
      case 'POTHOLE':
        return '⚠️ ROAD HAZARD AHEAD: Deep Pothole detected 180m ahead. Slow down and proceed with caution.';
      case 'PEDESTRIAN_HAZARD':
        return '⚠️ PEDESTRIAN HAZARD AHEAD: High-risk pedestrian crossing situation detected (120m). Reduce speed and remain alert.';
      case 'WATERLOGGING':
        return '⚠️ WATERLOGGING AHEAD: Affected road surface segment detected (150m). Reduce speed and proceed with caution.';
      case 'MISSING_SIGN':
        return '⚠️ TRAFFIC SIGN DEFICIENCY: Expected regulatory sign missing at junction. Obey standard right-of-way.';
      case 'DAMAGED_SIGN':
        return '⚠️ DAMAGED SIGN AHEAD: Unreadable/bent sign ahead. Obey standard junction caution.';
      case 'GARBAGE_SPILL':
        return '⚠️ ROADWAY OBSTACLE: Waste accumulation obstructing outer carriage-way (140m). Avoid curb lane.';
      default:
        return '⚠️ ROAD HAZARD AHEAD: Caution advised. Hazard detected ahead.';
    }
  }

  /**
   * Broadcast an instant C-V2X safety alert packet to nearby vehicles
   */
  broadcastHazard(hazard = {}) {
    this.isBroadcasting = true;
    this.broadcastCount++;
    this.activeAlertMessage = this.getCauseMessage(hazard);

    if (window.roadGuardAudio) {
      window.roadGuardAudio.playV2XBroadcast();
    }

    // Reset ACKs
    this.nearbyFleet.forEach(v => {
      v.ack = false;
      v.status = 'TRANSMITTING...';
    });
    this.notify();

    // Stagger ACK receipts realistically based on distance & latency
    this.nearbyFleet.forEach((v, index) => {
      setTimeout(() => {
        v.ack = true;
        v.status = `ACK ${v.latencyMs}ms`;
        this.notify();
      }, v.latencyMs + 80);
    });

    // End active pulse after 4.5 seconds
    setTimeout(() => {
      this.isBroadcasting = false;
      this.notify();
    }, 4500);
  }

  getFleet() {
    return this.nearbyFleet;
  }

  getConsensus() {
    return this.multiFleetConsensus;
  }
}

window.roadGuardV2X = new RoadGuardV2X();
