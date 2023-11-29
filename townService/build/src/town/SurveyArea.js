import InvalidParametersError from '../lib/InvalidParametersError';
import InteractableArea from './InteractableArea';
export default class SurveyArea extends InteractableArea {
    responses;
    type = 'SurveyArea';
    get isActive() {
        return this._occupants.length > 0;
    }
    constructor({ responses, id }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this.responses = responses;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this.responses = {};
            this._emitAreaChanged();
        }
    }
    toModel() {
        return {
            id: this.id,
            occupants: this.occupantsByID,
            responses: this.responses,
            type: 'SurveyArea',
        };
    }
    static fromMapObject(mapObject, broadcastEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed survey area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new SurveyArea({ responses: {}, id: name, occupants: [] }, rect, broadcastEmitter);
    }
    handleCommand() {
        throw new InvalidParametersError('Unknown command type');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VydmV5QXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1N1cnZleUFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxzQkFBc0IsTUFBTSwrQkFBK0IsQ0FBQztBQVNuRSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBRWxELE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVyxTQUFRLGdCQUFnQjtJQUMvQyxTQUFTLENBQXlCO0lBRXpCLElBQUksR0FBRyxZQUFZLENBQUM7SUFHcEMsSUFBVyxRQUFRO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFLRCxZQUNFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBaUMsRUFDaEQsV0FBd0IsRUFDeEIsV0FBd0I7UUFFeEIsS0FBSyxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQVFNLE1BQU0sQ0FBQyxNQUFjO1FBQzFCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBTU0sT0FBTztRQUNaLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDN0IsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLElBQUksRUFBRSxZQUFZO1NBQ25CLENBQUM7SUFDSixDQUFDO0lBUU0sTUFBTSxDQUFDLGFBQWEsQ0FDekIsU0FBMEIsRUFDMUIsZ0JBQTZCO1FBRTdCLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksRUFBRSxDQUFDLENBQUM7U0FDbEQ7UUFDRCxNQUFNLElBQUksR0FBZ0IsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDNUUsT0FBTyxJQUFJLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVNLGFBQWE7UUFHbEIsTUFBTSxJQUFJLHNCQUFzQixDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNGIn0=