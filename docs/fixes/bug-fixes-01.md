# Bug Fix Notes

## Bug #1 — Launcher Visual: Appears as Blue Box

**Issue:**
The launcher is rendering as a plain blue box instead of a graphical missile launcher.

**Expected Behavior:**
The launcher should visually resemble a missile launcher (e.g., a turret base with a barrel/cannon pointing upward or toward the cursor).

**Steps to Reproduce:**
1. Launch the game or test level.
2. Observe the launcher sprite/component on screen.

**Fix Needed:**
- Replace the placeholder blue box with a proper launcher graphic or sprite.
- Ensure the launcher barrel rotates or aims toward the target/cursor if applicable.

---

## Bug #2 — Missile Not Visible After Firing (Test Level)

**Issue:**
When pressing Tab to fire a missile in the test level, no missile or trail appears exiting the launcher.

**Expected Behavior:**
A missile should visibly launch from the launcher with a visible projectile and exhaust/smoke trail.

**Steps to Reproduce:**
1. Load the test level.
2. Press Tab to fire a missile.
3. Observe — no missile or trail is visible.

**Fix Needed:**
- Verify that the missile object is being instantiated and added to the scene on fire input.
- Check that the missile sprite/mesh and trail particle effect are properly attached and enabled.
- Confirm the missile's initial position spawns at the launcher barrel exit point, not inside the launcher geometry (which could cause it to be hidden).

---

## Bug #3 — Cities Floating Above Ground (Level 1)

**Issue:**
In Level 1, all cities appear to be floating in the air rather than sitting on the ground.

**Expected Behavior:**
Cities should be positioned on or flush with the ground plane.

**Steps to Reproduce:**
1. Load Level 1.
2. Observe city placement — cities are visibly elevated above the ground.

**Fix Needed:**
- Check the Y-position (or Z-position depending on axis orientation) of each city object.
- Verify the ground plane anchor point and adjust city spawn/placement coordinates accordingly.
- If cities use a pivot point at their center rather than their base, offset the placement by half the object height.

---

## Bug #4 — Missiles Not Launching in Level 1

**Issue:**
No enemy or player missiles launch during Level 1 gameplay. The level appears static with no missile activity.

**Expected Behavior:**
Enemy missiles should begin launching at cities after level start, and player should be able to fire missiles in response.

**Steps to Reproduce:**
1. Load and start Level 1.
2. Wait and observe — no missiles are fired by enemies.
3. Attempt to fire player missiles — none appear.

**Fix Needed:**
- Check whether the level's enemy wave/spawn system is being triggered on level load.
- Verify that the missile launch timer or event is initialized and running.
- Confirm that any dependencies (e.g., ground placement, city references) that were broken by Bug #3 are not also blocking the missile spawn logic.
- Check for null reference errors in the console that may be silently halting the spawn loop.