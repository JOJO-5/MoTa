interface Props {
  onClose: () => void
}

export function Settings({ onClose }: Props) {
  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal__eyebrow">SYSTEM / CONFIG</div>
        <h2 id="settings-title">游戏设置</h2>
        <div className="setting-row">
          <label htmlFor="bgm-volume">BGM 音量</label>
          <input id="bgm-volume" type="range" min="0" max="100" defaultValue="50" />
        </div>
        <div className="setting-row">
          <label htmlFor="sfx-volume">SFX 音量</label>
          <input id="sfx-volume" type="range" min="0" max="100" defaultValue="70" />
        </div>
        <div className="setting-row">
          <label htmlFor="show-minimap">显示小地图</label>
          <input id="show-minimap" type="checkbox" defaultChecked />
        </div>
        <button className="close-btn" onClick={onClose}>
          返回主菜单
        </button>
      </div>
    </div>
  )
}
