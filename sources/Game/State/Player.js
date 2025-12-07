import { vec3 } from 'gl-matrix'

import Game from '@/Game.js'
import State from '@/State/State.js'
import Camera from './Camera.js'

export default class Player
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time
        this.controls = this.state.controls

        this.rotation = 0
        this.inputSpeed = 10
        this.inputBoostSpeed = 30
        this.speed = 0

        this.position = {}
        this.position.current = vec3.fromValues(10, 0, 1)
        this.position.previous = vec3.clone(this.position.current)
        this.position.delta = vec3.create()

        this.jump = {}
        this.jump.force = 5
        this.jump.gravity = 20
        this.jump.velocity = 0
        this.jump.isJumping = false
        this.jump.groundElevation = 0

        this.camera = new Camera(this)

        this.controls.events.on('jumpDown', () =>
        {
            if(!this.jump.isJumping && this.camera.mode !== Camera.MODE_FLY)
            {
                this.jump.isJumping = true
                this.jump.velocity = this.jump.force
            }
        })

        this.controls.events.on('shootDown', () =>
        {
            this.shoot()
        })
    }

    shoot()
    {
        // Only shoot if pointer lock is active (not in pause menu)
        if(!this.state.viewport.pointerLock.active)
            return
            
        // Calculate shoot position (slightly in front and above player)
        const shootPosition = vec3.create()
        vec3.copy(shootPosition, this.position.current)
        shootPosition[1] += 1.5 // Eye level
        
        // Calculate shoot direction based on camera orientation
        const direction = vec3.create()
        const theta = this.camera.thirdPerson.theta
        const phi = this.camera.thirdPerson.phi
        
        direction[0] = -Math.sin(theta) * Math.sin(phi)
        direction[1] = -Math.cos(phi)
        direction[2] = -Math.cos(theta) * Math.sin(phi)
        
        vec3.normalize(direction, direction)
        
        // Create projectile
        this.state.projectiles.create(shootPosition, direction)
    }

    update()
    {
        if(this.camera.mode !== Camera.MODE_FLY && (this.controls.keys.down.forward || this.controls.keys.down.backward || this.controls.keys.down.strafeLeft || this.controls.keys.down.strafeRight))
        {
            this.rotation = this.camera.thirdPerson.theta

            if(this.controls.keys.down.forward)
            {
                if(this.controls.keys.down.strafeLeft)
                    this.rotation += Math.PI * 0.25
                else if(this.controls.keys.down.strafeRight)
                    this.rotation -= Math.PI * 0.25
            }
            else if(this.controls.keys.down.backward)
            {
                if(this.controls.keys.down.strafeLeft)
                    this.rotation += Math.PI * 0.75
                else if(this.controls.keys.down.strafeRight)
                    this.rotation -= Math.PI * 0.75
                else
                    this.rotation -= Math.PI
            }
            else if(this.controls.keys.down.strafeLeft)
            {
                this.rotation += Math.PI * 0.5
            }
            else if(this.controls.keys.down.strafeRight)
            {
                this.rotation -= Math.PI * 0.5
            }

            const speed = this.controls.keys.down.boost ? this.inputBoostSpeed : this.inputSpeed

            const x = Math.sin(this.rotation) * this.time.delta * speed
            const z = Math.cos(this.rotation) * this.time.delta * speed

            this.position.current[0] -= x
            this.position.current[2] -= z
        }

        vec3.sub(this.position.delta, this.position.current, this.position.previous)
        vec3.copy(this.position.previous, this.position.current)

        this.speed = vec3.len(this.position.delta)
        
        // Update view
        this.camera.update()

        // Update elevation
        const chunks = this.state.chunks
        const elevation = chunks.getElevationForPosition(this.position.current[0], this.position.current[2])

        if(elevation)
            this.jump.groundElevation = elevation
        else
            this.jump.groundElevation = 0

        // Update jump physics
        if(this.jump.isJumping)
        {
            this.jump.velocity -= this.jump.gravity * this.time.delta
            this.position.current[1] += this.jump.velocity * this.time.delta

            // Check if landed
            if(this.position.current[1] <= this.jump.groundElevation)
            {
                this.position.current[1] = this.jump.groundElevation
                this.jump.isJumping = false
                this.jump.velocity = 0
            }
        }
        else
        {
            this.position.current[1] = this.jump.groundElevation
        }
    }
}