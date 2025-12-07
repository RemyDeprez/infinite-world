import * as THREE from 'three'

import Game from '@/Game.js'
import View from '@/View/View.js'
import State from '@/State/State.js'

export default class Projectiles
{
    constructor()
    {
        this.game = Game.getInstance()
        this.view = View.getInstance()
        this.state = State.getInstance()
        this.scene = this.view.scene
        this.projectiles = this.state.projectiles

        this.items = new Map()
        
        this.projectiles.events.on('create', (projectile) =>
        {
            this.createMesh(projectile)
        })
        
        this.projectiles.events.on('destroy', (projectile) =>
        {
            this.destroyMesh(projectile)
        })
    }

    createMesh(projectile)
    {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8)
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1.5,
            roughness: 0.3,
            metalness: 0.1
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
            projectile.position[0],
            projectile.position[1],
            projectile.position[2]
        )
        
        this.scene.add(mesh)
        this.items.set(projectile.id, { mesh, projectile })
    }

    destroyMesh(projectile)
    {
        const item = this.items.get(projectile.id)
        
        if(item)
        {
            this.scene.remove(item.mesh)
            item.mesh.geometry.dispose()
            item.mesh.material.dispose()
            this.items.delete(projectile.id)
        }
    }

    update()
    {
        for(const [id, item] of this.items)
        {
            item.mesh.position.set(
                item.projectile.position[0],
                item.projectile.position[1],
                item.projectile.position[2]
            )
        }
    }
}
