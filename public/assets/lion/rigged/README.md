# Production Lion GLB

Place the approved Blender export at `public/assets/lion/rigged/lion.glb`.

Before enabling it, run:

```bash
npm run lion:validate
```

The validator enforces the bone hierarchy, four complete leg chains, animation
clip names, skinned vertex attributes, and facial morph names in
`src/data/lionRigContract.json`. The app must keep
`VITE_RIGGED_LION_ENABLED=false` until validation passes and visual QA confirms
identity, ground contact, animation mixing, reduced motion, and mobile framing.

PNG pose files are visual references and temporary fallback art. They are not a
source model and cannot be converted into a genuine quadruped rig without a new
modeled mesh, topology, armature, skin weights, and authored facial shapes.
