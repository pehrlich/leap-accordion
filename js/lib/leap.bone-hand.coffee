initScene = (targetEl)->
  window.scene = scene = new THREE.Scene()
  renderer = new THREE.WebGLRenderer({
    alpha: true
  })

  width = window.innerWidth
  height = window.innerHeight

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(width, height)

  renderer.domElement.className = "leap-boneHand"

  targetEl.appendChild(renderer.domElement)

  directionalLight = directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )
  directionalLight.position.set( 0, 0.5, 1 )
  scene.add(directionalLight)

  directionalLight = directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )
  directionalLight.position.set( 0.5, -0.5, -1 )
  scene.add(directionalLight)

  directionalLight = directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 )
  directionalLight.position.set( -0.5, 0, -0.2 )
  scene.add(directionalLight)

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000)

  camera.position.fromArray([0, 300, 500]);
  camera.lookAt(new THREE.Vector3(0, 160, 0));


  scene.add(camera)

  renderer.render(scene, camera)


  window.addEventListener 'resize', ->
    width = window.innerWidth
    height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize( width, height )

    renderer.render(scene, camera)
  , false

  render = ->
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);

  render()



# bone hand methods copied from leapdev

baseBoneRotation = (new THREE.Quaternion).setFromEuler(
  new THREE.Euler(Math.PI / 2, 0, 0)
);


jointColor = (new THREE.Color).setHex(0x5daa00)
boneWhite = (new THREE.Color).setHex(0xffffff)

jointSize = 8


boneHand = (hand) ->
  hand.fingers.forEach (finger) ->

    # the handFound listener doesn't actually fire if in live mode with hand-in-screen
    # we manually check for finger meshes and initialize if necessary
    boneMeshes = finger.data("boneMeshes")
    jointMeshes = finger.data("jointMeshes")

    unless boneMeshes
      boneMeshes = []
      jointMeshes = []

      unless finger.bones
        console.warn("error, no bones on", hand.id)
        return

      finger.bones.forEach (bone) ->

        # create joints

        # CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
        boneMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(5, 5, bone.length),
          new THREE.MeshPhongMaterial()
        )
        boneMesh.material.color.copy(boneWhite)
        scene.add boneMesh
        boneMeshes.push boneMesh

        jointMesh = new THREE.Mesh(
          new THREE.SphereGeometry(jointSize),
          new THREE.MeshPhongMaterial()
        )
        jointMesh.material.color.copy(jointColor)
        scene.add jointMesh
        jointMeshes.push jointMesh

      jointMesh = new THREE.Mesh(
        new THREE.SphereGeometry(jointSize),
        new THREE.MeshPhongMaterial()
      )
      jointMesh.material.color.copy(jointColor)
      scene.add jointMesh
      jointMeshes.push jointMesh

      finger.data "boneMeshes", boneMeshes
      finger.data "jointMeshes", jointMeshes

    boneMeshes.forEach (mesh, i) ->
      bone = finger.bones[i]
      mesh.position.fromArray bone.center()
      mesh.setRotationFromMatrix (new THREE.Matrix4).fromArray(bone.matrix())
      mesh.quaternion.multiply baseBoneRotation

    jointMeshes.forEach (mesh, i) ->
      bone = finger.bones[i]
      if bone
        mesh.position.fromArray bone.prevJoint
      else
        bone = finger.bones[i-1]
        mesh.position.fromArray bone.nextJoint


boneHandLost = (hand) ->
  hand.fingers.forEach (finger) ->
    boneMeshes = finger.data("boneMeshes")
    jointMeshes = finger.data("jointMeshes")

    return unless boneMeshes

    boneMeshes.forEach (mesh) ->
      scene.remove mesh

    jointMeshes.forEach (mesh) ->
      scene.remove mesh

    finger.data(boneMeshes: null)
    finger.data(jointMeshes: null)

  armMesh = hand.data('armMesh');
  scene.remove(armMesh);
  hand.data('armMesh', null);


Leap.plugin 'boneHand', (scope = {}) ->

  @use('handEntry')
  @use('handHold')

  console.assert(scope.targetEl)
  initScene(scope.targetEl)

  @on 'handLost', boneHandLost

  {
    hand: boneHand
  }