interface Props {
  onStart: () => void
  onContinue: () => void
  onSettings: () => void
  hasSave: boolean
}

export function MainMenu({ onStart, onContinue, onSettings, hasSave }: Props) {
  const baseUrl =
    (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './'

  return (
    <main
      className="main-menu"
      aria-labelledby="game-title"
      style={{ backgroundImage: `url("${baseUrl}art/mota-title-bg-v1.png")` }}
    >
      <div className="title-atmosphere" aria-hidden="true" />
      <div className="title-copy">
        <img
          className="title-sigil"
          src={`${baseUrl}art/mota-sigil-v1.png`}
          alt=""
          aria-hidden="true"
        />
        <p className="title-kicker">THE TOWER // REBUILT EDITION</p>
        <h1 id="game-title" className="title">
          魔塔 <span>2014</span>
        </h1>
        <p className="subtitle">一场关于勇气、钥匙与临界值的像素冒险</p>
      </div>
      <div className="menu-card">
        <div className="menu-card__label">主塔入口 · MT0</div>
        <div className="menu-buttons">
          <button className="menu-button menu-button--primary" onClick={onStart}>
            <span>开始攀登</span>
            <small>ENTER</small>
          </button>
          <button className="menu-button" onClick={onContinue} disabled={!hasSave}>
            <span>继续游戏</span>
            <small>LOAD</small>
          </button>
          <button className="menu-button" onClick={onSettings}>
            <span>游戏设置</span>
            <small>SETTINGS</small>
          </button>
        </div>
      </div>
      <div className="title-footer">
        <span>65 FLOOR IDS</span>
        <i /> <span>PIXEL FANTASY</span>
        <i /> <span>v0.1.0</span>
      </div>
    </main>
  )
}
