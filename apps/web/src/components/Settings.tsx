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
        <div className="settings-status" role="status">
          <div className="setting-row setting-row--disabled">
            <span>BGM / SFX 音量</span>
            <span className="setting-value">音频功能开发中</span>
          </div>
          <div className="setting-row setting-row--disabled">
            <span>显示小地图</span>
            <span className="setting-value">小地图功能开发中</span>
          </div>
          <p className="settings-hint">
            当前版本的运行时尚未接入音频和小地图设置，相关控件将在功能接入后开放。
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          返回主菜单
        </button>
      </div>
    </div>
  )
}
