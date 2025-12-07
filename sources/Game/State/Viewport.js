import Game from '@/Game.js'
import State from '@/State/State.js'

export default class Viewport
{
    constructor()
    {
        this.game = Game.getInstance()
        this.state = State.getInstance()
        this.controls = this.state.controls

        this.width = null
        this.height = null
        this.smallestSide = null
        this.biggestSide = null
        this.pixelRatio = null
        this.clampedPixelRatio = null

        this.setPointerLock()
        this.setFullscreen()
        this.setPause()

        this.controls.events.on('pointerLockDown', () =>
        {
            this.pointerLock.toggle()
        })

        this.controls.events.on('fullscreenDown', () =>
        {
            this.fullscreen.toggle()
        })

        this.controls.events.on('pauseDown', () =>
        {
            this.pause.toggle()
        })

        this.resize()

        // Activate pointer lock automatically on first click
        window.addEventListener('click', () =>
        {
            if(!this.pointerLock.active && !this.pause.active)
            {
                this.pointerLock.activate()
            }
        }, { once: false })
    }

    setPointerLock()
    {
        this.pointerLock = {}
        this.pointerLock.active = false
        
        this.pointerLock.toggle = () =>
        {
            if(this.pointerLock.active)
                this.pointerLock.deactivate()
            else
                this.pointerLock.activate()
        }
        
        this.pointerLock.activate = () =>
        {
            if(this.game.domElement)
                this.game.domElement.requestPointerLock()
            else
                document.body.requestPointerLock()
        }

        this.pointerLock.deactivate = () =>
        {
            document.exitPointerLock()
        }
        
        document.addEventListener('pointerlockchange', () =>
        {
            this.pointerLock.active = !!document.pointerLockElement
            
            // If pointer lock is deactivated, activate pause
            if(!this.pointerLock.active && !this.pause.active)
            {
                this.pause.activate()
            }
        })
    }

    setPause()
    {
        this.pause = {}
        this.pause.active = false
        this.pause.element = null
        
        this.pause.toggle = () =>
        {
            if(this.pause.active)
                this.pause.deactivate()
            else
                this.pause.activate()
        }
        
        this.pause.activate = () =>
        {
            this.pause.active = true
            this.pointerLock.deactivate()
            this.pause.show()
        }

        this.pause.deactivate = () =>
        {
            this.pause.active = false
            this.pause.hide()
            this.pointerLock.activate()
        }
        
        this.pause.show = () =>
        {
            if(!this.pause.element)
            {
                this.pause.element = document.createElement('div')
                this.pause.element.classList.add('pause-menu')
                this.pause.element.innerHTML = `
                    <div class="pause-content">
                        <h1>PAUSE</h1>
                        <p>Appuyez sur <span class="key">ECHAP</span> ou cliquez pour reprendre</p>
                    </div>
                `
                document.body.appendChild(this.pause.element)
                
                // Click to resume
                this.pause.element.addEventListener('click', () =>
                {
                    this.pause.deactivate()
                })
            }
            this.pause.element.style.display = 'flex'
        }
        
        this.pause.hide = () =>
        {
            if(this.pause.element)
            {
                this.pause.element.style.display = 'none'
            }
        }
    }

    setFullscreen()
    {
        this.fullscreen = {}
        this.fullscreen.active = false
        
        this.fullscreen.toggle = () =>
        {
            if(this.fullscreen.active)
                this.fullscreen.deactivate()
            else
                this.fullscreen.activate()
        }
        
        this.fullscreen.activate = () =>
        {
            if(this.game.domElement)
                this.game.domElement.requestFullscreen()
            else
                document.body.requestFullscreen()
        }

        this.fullscreen.deactivate = () =>
        {
            document.exitFullscreen()
        }
        
        document.addEventListener('fullscreenchange', () =>
        {
            this.fullscreen.active = !!document.fullscreenElement
        })
    }

    normalise(pixelCoordinates)
    {
        const minSize = Math.min(this.width, this.height)
        return {
            x: pixelCoordinates.x / minSize,
            y: pixelCoordinates.y / minSize,
        }
    }

    resize()
    {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.smallestSide = this.width < this.height ? this.width : this.height
        this.biggestSide = this.width > this.height ? this.width : this.height
        this.pixelRatio = window.devicePixelRatio
        this.clampedPixelRatio = Math.min(this.pixelRatio, 2)
    }
}