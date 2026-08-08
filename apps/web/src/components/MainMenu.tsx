interface Props {
  onStart: () => void
  onSettings: () => void
}

export function MainMenu({ onStart, onSettings }: Props) {
  return (
    <div className="main-menu">
      <h1 className="title">魔塔 2014</h1>
      <p className="subtitle">Modern Mota Engine</p>
      <div className="menu-buttons">
        <button onClick={onStart}>开始游戏</button>
        <button onClick={onSettings}>游戏设置</button>
        <button onClick={() => alert('继续游戏')}>继续游戏</button>
      </div>
    </div>
  )
}
