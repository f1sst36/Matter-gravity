export class FoodGenerator {
    private readonly areaContainer: HTMLElement

    constructor(areaContainer: HTMLElement) {
        this.areaContainer = areaContainer
    }

    private createFoodHTMLElement(type: 'bug' | 'feature') {
        const div = document.createElement('div')
        div.classList.add('food', `food--${type}`)
        div.innerHTML = type
        return div
    }

    private mountToArea(node: HTMLElement) {
        this.areaContainer.appendChild(node)
    }

    public startGenerating(cb: (node: HTMLElement) => any) {
        setInterval(() => {
            const foodNode = this.createFoodHTMLElement(Math.round(Math.random()) ? 'bug' : 'feature')
            this.mountToArea(foodNode)
            cb(foodNode)
        }, 2_000)
    }
}