import SurveyController, {
    SurveyAreaEvents,
  } from '../../../classes/interactable/SurveyController';
  import { BoundingBox } from '../../../types/CoveyTownSocket';
  import Interactable, { KnownInteractableTypes } from '../Interactable';
  
  export default class SurveyArea extends Interactable {
    private _responsesTextOrUndefined?: Phaser.GameObjects.Text;
  
    private _infoTextBox?: Phaser.GameObjects.Text;
  
    private _surveyArea?: SurveyController;
  
    private _changeListener?: SurveyAreaEvents['responsesChange'];
  
    private get _responsesText() {
      const ret = this._responsesTextOrUndefined;
      if (!ret) {
        throw new Error('Expected response text to be defined');
      }
      return ret;
    }
  
    getType(): KnownInteractableTypes {
      return 'surveyArea';
    }
  
    removedFromScene(): void {
      if (this._changeListener) {
        this._surveyArea?.removeListener('responsesChange', this._changeListener);
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
      this._responsesTextOrUndefined = this.scene.add.text(
        this.x - this.displayWidth / 2,
        this.y + this.displayHeight / 2,
        '(No responses)',
        { color: '#000000' },
      );
      this._surveyArea = this.townController.getSurveyAreaController(this);
      this._updateLabelText(this._formatResponses(this._surveyArea.responses));
      this._changeListener = newResponses => this._updateLabelText(this._formatResponses(newResponses));
      this._surveyArea.addListener('responsesChange', this._changeListener);
    }
  
    private _updateLabelText(newResponses: string | undefined) {
      if (newResponses === undefined) {
        this._responsesText.text = '(No responses)';
      } else {
        if (this.isOverlapping) {
          this._scene.moveOurPlayerTo({ interactableID: this.name });
        }
        this._responsesText.text = newResponses;
        if (this._infoTextBox && this._infoTextBox.visible) {
          this._infoTextBox.setVisible(false);
        }
      }
    }

    private _formatResponses(responses: Record<string, number>): string {
        let formattedResponses = '';
        Object.keys(responses).forEach((response) => {
            formattedResponses += `${response}: ${responses[response]}\n`;
        });
        return formattedResponses;
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
            "You've found an empty survey area!\nStop by and provide some feedback\nAnswer a survey by pressing the spacebar.",
            { color: '#000000', backgroundColor: '#FFFFFF' },
          )
          .setScrollFactor(0)
          .setDepth(30);
      }
      this._infoTextBox.setVisible(true);
      this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
    }
  
    overlap(): void {
      if (this._surveyArea) {
        const isResponseEmpty = Object.keys(this._surveyArea.responses).length === 0;
        if (isResponseEmpty) {
          this._showInfoBox();
        }
      }
    }
  
    overlapExit(): void {
      this._infoTextBox?.setVisible(false);
    }
  }