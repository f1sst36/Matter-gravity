import {Position} from "../types";

type CursorType = 'default' | 'gravity'

export default class Pointer {
    private position: Position = {x: 0, y: 0}
    private cursorNode: HTMLElement | null = null
    private readonly container: HTMLElement
    private readonly areaRadius = 160

    constructor(container: HTMLElement) {
        this.container = container
    }

    setCursorType(type: CursorType) {
        switch (type) {
            case 'default': {
                this.setDefaultCursor()
                break
            }
            case 'gravity': {
                this.setGravityCursor()
                break
            }
        }
    }

    public updatePosition(position: Position) {
        this.position = position
        if (this.cursorNode) {
            this.cursorNode.style.transform = `translate(calc(${this.position.x}px - 50%), calc(${this.position.y}px - 50%))`
        }
    }

    public isInCursorArea(bodyPosition: Position) {
        return (
            bodyPosition.x <= (this.position.x + this.areaRadius)
            && bodyPosition.x >= (this.position.x - this.areaRadius)
            && bodyPosition.y >= (this.position.y - this.areaRadius)
            && bodyPosition.y <= (this.position.y + this.areaRadius)
        )
    }

    private setDefaultCursor() {
        document.body.style.cursor = 'unset'
        this.removeGravityCursor()
    }

    private setGravityCursor() {
        if (this.cursorNode) {
            return
        }

        // document.body.style.cursor = 'none'

        this.cursorNode = document.createElement('div')
        this.cursorNode.classList.add('gravity-cursor', 'gravity-cursor-show')
        this.updatePosition(this.position)

        this.container.appendChild(this.cursorNode)
    }

    private removeGravityCursor() {
        if (!this.cursorNode) {
            return
        }

        this.cursorNode.classList.add('gravity-cursor-hide')

        // setTimeout(() => {
            if (this.cursorNode) {
                this.container.removeChild(this.cursorNode)
            }
            this.cursorNode = null
        // }, 350)
    }
}