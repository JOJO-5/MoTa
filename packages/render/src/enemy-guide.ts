import type { Enemy } from '@modern-mota/data'

export class EnemyGuide {
  private container: HTMLElement | null = null

  show(enemy: Enemy) {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'mota-enemy-guide'
      document.body.appendChild(this.container)
    }
    this.container.innerHTML = `
      <div class="mota-enemy-guide__card">
        <h3>${enemy.name}</h3>
        <p>HP: ${enemy.hp} | ATK: ${enemy.atk} | DEF: ${enemy.def}</p>
        <p>💰 ${enemy.money} | ✨ ${enemy.exp}</p>
        ${enemy.special?.length ? `<p>特效: ${enemy.special.join(', ')}</p>` : ''}
        <button onclick="this.parentElement.parentElement?.remove()">关闭</button>
      </div>
    `
  }

  hide() {
    this.container?.remove()
    this.container = null
  }
}
