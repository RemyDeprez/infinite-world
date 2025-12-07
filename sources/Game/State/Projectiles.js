import { vec3 } from 'gl-matrix'
import EventsEmitter from 'events'

import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Projectiles
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.time = this.state.time

        this.events = new EventsEmitter()
        
        this.items = []
        this.speed = 50
        this.lifetime = 3 // seconds
        this.nextId = 0
    }

    create(position, direction)
    {
        const projectile = {}
        projectile.id = this.nextId++
        projectile.position = vec3.clone(position)
        projectile.direction = vec3.clone(direction)
        projectile.velocity = vec3.create()
        projectile.age = 0
        
        // Calculate velocity
        vec3.scale(projectile.velocity, projectile.direction, this.speed)
        
        this.items.push(projectile)
        this.events.emit('create', projectile)
        
        return projectile
    }

    destroy(projectile)
    {
        const index = this.items.indexOf(projectile)
        
        if(index !== -1)
        {
            this.items.splice(index, 1)
            this.events.emit('destroy', projectile)
        }
    }

    update()
    {
        const projectilesToDestroy = []
        
        for(const projectile of this.items)
        {
            // Update age
            projectile.age += this.time.delta
            
            // Update position
            const displacement = vec3.create()
            vec3.scale(displacement, projectile.velocity, this.time.delta)
            vec3.add(projectile.position, projectile.position, displacement)
            
            // Check lifetime
            if(projectile.age >= this.lifetime)
            {
                projectilesToDestroy.push(projectile)
            }
        }
        
        // Destroy old projectiles
        for(const projectile of projectilesToDestroy)
        {
            this.destroy(projectile)
        }
    }
}
