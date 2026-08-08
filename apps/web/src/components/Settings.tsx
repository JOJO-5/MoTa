interface Props {
  onClose: () => void
}

export function Settings({ onClose }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal settings">
        <h2>游戏设置</h2>
        <div className="setting-row">
          <label>BGM 音量</label>
          <input type="range" min="0" max="100" defaultValue="50" />
        </div>
        <div className="setting-row">
          <label>SFX 音量</label>
          <input type="range" min="0" max="100" defaultValue="70" />
        </div>
        <div className="setting-row">
          <label>显示小地图</label>
          <input type="checkbox" defaultChecked />
        </div>
        <button className="close-btn" onClick={onClose}>关闭</button>
      </div>
    </div>
  )
}
