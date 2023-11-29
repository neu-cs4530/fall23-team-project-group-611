import VotingAreaController, {
  VotingAreaEvents,
} from '../../../classes/interactable/VotingAreaController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class VotingArea extends Interactable {
  private _pollTextOrUndefined?: Phaser.GameObjects.Text;

  private _infoTextBox?: Phaser.GameObjects.Text;

  private _votingArea?: VotingAreaController;

  private _changeListener?: VotingAreaEvents['pollChange'];

  private get _pollText() {
    const ret = this._pollTextOrUndefined;
    if (!ret) {
      throw new Error('Expected poll text to be defined');
    }
    return ret;
  }

  getType(): KnownInteractableTypes {
    return 'votingArea';
  }

  removedFromScene(): void {
    if (this._changeListener) {
      this._votingArea?.removeListener('pollChange', this._changeListener);
    }
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._pollTextOrUndefined = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      '(No poll)',
      { color: '#000000' },
    );
    this._votingArea = this.townController.getVotingAreaController(this);
    this._updateLabelText(this._votingArea.poll);
    this._changeListener = newpoll => this._updateLabelText(newpoll);
    this._votingArea.addListener('pollChange', this._changeListener);
  }

  private _updateLabelText(newpoll: string) {
    if (newpoll === '') {
      this._pollText.text = '(No poll)';
    } else {
      if (this.isOverlapping) {
        this._scene.moveOurPlayerTo({ interactableID: this.name });
      }
      this._pollText.text = newpoll;
      if (this._infoTextBox && this._infoTextBox.visible) {
        this._infoTextBox.setVisible(false);
      }
    }
  }

  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found an empty voting area!\nTell others what you'd like to talk about here\nby providing a poll label for the voting.\nSpecify a poll by pressing the spacebar.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    if (this._votingArea?.poll === '') {
      this._showInfoBox();
    }
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
