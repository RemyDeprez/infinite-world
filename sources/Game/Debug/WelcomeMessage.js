export default class WelcomeMessage
{
    constructor()
    {
        this.element = document.querySelector('.welcome-message')
        
        if(!this.element)
            return

        this.show()
    }

    show()
    {
        // Start fade out after 1.5 seconds
        setTimeout(() =>
        {
            this.fadeOut()
        }, 1500)
    }

    fadeOut()
    {
        this.element.classList.add('fade-out')
        
        // Remove element from DOM after transition
        setTimeout(() =>
        {
            this.element.classList.add('hidden')
        }, 500) // Match CSS transition duration
    }
}
