export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function computeGroundY(size) {
  return window.innerHeight - size - 56;
}

export function animateBit(bitElement, { startX, groundY, size, tilt, physics }, reducedMotion, onFinish) {
  if (!bitElement.animate || reducedMotion.matches) {
    onFinish(bitElement, startX, groundY, Number(tilt) * 0.25, size);
    return;
  }

  const minX = 0;
  const maxX = Math.max(0, window.innerWidth - size);
  let x = startX;
  let y = -size - 20;
  let vx = physics.vx;
  let vy = physics.initialVy;
  let rotation = Number(tilt);
  let rotationVelocity = physics.rotationVelocity;
  let bounceCount = 0;
  let touchedGround = false;
  let settleStartedAt = null;
  let finished = false;
  let previousTimestamp = performance.now();
  const startedAt = previousTimestamp;

  const finalize = () => {
    if (finished) {
      return;
    }

    finished = true;
    onFinish(bitElement, x, y, rotation, size);
  };

  const step = (timestamp) => {
    if (finished) {
      return;
    }

    const dt = Math.min(0.033, Math.max(0.008, (timestamp - previousTimestamp) / 1000));
    previousTimestamp = timestamp;

    const airDragFactor = Math.pow(physics.airDrag, dt * 60);
    vx *= airDragFactor;
    rotationVelocity *= Math.pow(physics.angularAirDrag, dt * 60);

    vy += physics.gravity * dt;
    x += vx * dt;
    y += vy * dt;
    rotation += rotationVelocity * dt;

    if (x <= minX || x >= maxX) {
      x = Math.max(minX, Math.min(maxX, x));
      vx *= -0.45;
      rotationVelocity *= 0.88;
    }

    if (y >= groundY) {
      y = groundY;
      touchedGround = true;

      if (Math.abs(vy) > physics.minBounceVelocity && bounceCount < physics.maxBounces) {
        const bounceScale = Math.max(0.42, 1 - bounceCount * 0.16);
        vy = -Math.abs(vy) * physics.restitution * bounceScale;

        if (bounceCount === 0) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          vx = direction * randomBetween(physics.firstBounceKickMin, physics.firstBounceKickMax);
          bitElement.dataset.firstBounceDirection = direction < 0 ? "left" : "right";
          bitElement.dataset.firstBounceKick = String(Math.round(Math.abs(vx)));
        } else {
          vx *= physics.groundFriction;
        }

        rotationVelocity *= physics.angularDamping;
        bounceCount += 1;
        settleStartedAt = null;
      } else {
        vy = 0;
        vx *= 0.82;
        rotationVelocity *= 0.78;

        if (settleStartedAt === null) {
          settleStartedAt = timestamp;
        }

        if (timestamp - settleStartedAt >= physics.settleDelayMs) {
          finalize();
          return;
        }
      }
    }

    bitElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

    if (touchedGround && timestamp - startedAt >= physics.maxLifetimeMs) {
      finalize();
      return;
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}
