import { useEffect, useState } from 'react';
import { SurveyArea as SurveyAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type SurveyAreaEvents = BaseInteractableEventMap & {
    surveyChange: (newSurvey: Record<string, number>) => void;
  };

export default class SurveyController extends InteractableAreaController<
  SurveyAreaEvents,
  SurveyAreaModel
> {
    private _responses: Record<string, number>;

    /**
     * 
     */
    constructor(id: string, responses: Record<string, number>) {
      super(id);
      this._responses = responses;
    }

    // TODO: will want to check if the survey is active or not , logic of determining if survey is active
    public isActive(): boolean {
        return this._responses !== undefined && this.occupants.length > 0;
        }

    set responses(newResponses: Record<string, number>) {
        if (this._responses !== newResponses) {
            this.emit('responsesChange', newResponses);
        }
        this._responses = newResponses;
    }

    get responses(): Record<string, number> {
        return this._responses;
    }   

    protected _updateFrom(newModel: SurveyAreaModel): void {
        this.responses = newModel.responses;
    }

    isEmpty(): boolean {
        return this._responses === undefined || this.occupants.length === 0;
    }

    /**
     * Return a rep of this SurveyController that matches townservice's expectations
     */
    toInteractableAreaModel(): SurveyAreaModel {
        return {
            id: this.id,
            occupants: this.occupants.map(player => player.id),
            responses: this.responses,
            type: 'SurveyArea',
        };
    }

    /**
     * 
     */
    static fromSurveyAreaModel(
        model: SurveyAreaModel,
        playerFinder: (playerIDs: string[]) => PlayerController[],
      ): SurveyController {{
        const ret = new SurveyController(model.id, model.responses);
        ret.occupants = playerFinder(model.occupants);
        return ret;
        }
    }
}

/**
 * A react hook to retrieve the votes of a SurveyAreaController.
 *
 * This hook will re-render any components that use it when the votes changes.
 */
 export function useVotingAreaVotes(area: SurveyController): Record<string, number> {
    const [responses, setResponses] = useState(area.responses);
    useEffect(() => {
      area.addListener('responsesChange', setResponses);
      return () => {
        area.removeListener('votesChange', setResponses);
      };
    }, [area]);
    return responses;
  }
