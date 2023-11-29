import InvalidParametersError from '../lib/InvalidParametersError';
import InteractableArea from './InteractableArea';
export default class VotingArea extends InteractableArea {
    votes;
    get isActive() {
        return this._occupants.length > 0;
    }
    constructor({ votes, id }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this.votes = votes;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this.votes = 0;
            this._emitAreaChanged();
        }
    }
    toModel() {
        return {
            id: this.id,
            occupants: this.occupantsByID,
            votes: this.votes,
            type: 'VotingArea',
        };
    }
    static fromMapObject(mapObject, broadcastEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new VotingArea({ votes: 0, id: name, occupants: [] }, rect, broadcastEmitter);
    }
    handleCommand() {
        throw new InvalidParametersError('Unknown command type');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVm90aW5nQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1ZvdGluZ0FyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxzQkFBc0IsTUFBTSwrQkFBK0IsQ0FBQztBQVNuRSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBRWxELE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVyxTQUFRLGdCQUFnQjtJQUUvQyxLQUFLLENBQVM7SUFHckIsSUFBVyxRQUFRO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFTRCxZQUNFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBaUMsRUFDNUMsV0FBd0IsRUFDeEIsV0FBd0I7UUFFeEIsS0FBSyxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQVVNLE1BQU0sQ0FBQyxNQUFjO1FBQzFCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFNTSxPQUFPO1FBQ1osT0FBTztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLFlBQVk7U0FDbkIsQ0FBQztJQUNKLENBQUM7SUFRTSxNQUFNLENBQUMsYUFBYSxDQUN6QixTQUEwQixFQUMxQixnQkFBNkI7UUFFN0IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNuRDtRQUNELE1BQU0sSUFBSSxHQUFnQixFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUM1RSxPQUFPLElBQUksVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU0sYUFBYTtRQUdsQixNQUFNLElBQUksc0JBQXNCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0YifQ==