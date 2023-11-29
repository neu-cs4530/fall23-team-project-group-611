var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import assert from 'assert';
import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Response, Route, Tags, } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
let TownsController = class TownsController extends Controller {
    _townsStore = CoveyTownsStore.getInstance();
    async listTowns() {
        return this._townsStore.getTowns();
    }
    async createTown(request) {
        const { townID, townUpdatePassword } = await this._townsStore.createTown(request.friendlyName, request.isPubliclyListed, request.mapFile);
        return {
            townID,
            townUpdatePassword,
        };
    }
    async updateTown(townID, townUpdatePassword, requestBody) {
        const success = this._townsStore.updateTown(townID, townUpdatePassword, requestBody.friendlyName, requestBody.isPubliclyListed);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async deleteTown(townID, townUpdatePassword) {
        const success = this._townsStore.deleteTown(townID, townUpdatePassword);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async createConversationArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addConversationArea({ ...requestBody, type: 'ConversationArea' });
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createVotingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addVotingArea({ ...requestBody, type: 'VotingArea' });
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createViewingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addViewingArea({ ...requestBody, type: 'ViewingArea' });
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async joinTown(socket) {
        const { userName, townID } = socket.handshake.auth;
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            socket.disconnect(true);
            return;
        }
        socket.join(town.townID);
        const newPlayer = await town.addPlayer(userName, socket);
        assert(newPlayer.videoToken);
        socket.emit('initialize', {
            userID: newPlayer.id,
            sessionToken: newPlayer.sessionToken,
            providerVideoToken: newPlayer.videoToken,
            currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
            friendlyName: town.friendlyName,
            isPubliclyListed: town.isPubliclyListed,
            interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
        });
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "listTowns", null);
__decorate([
    Example({ townID: 'stringID', townUpdatePassword: 'secretPassword' }),
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createTown", null);
__decorate([
    Patch('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "updateTown", null);
__decorate([
    Delete('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "deleteTown", null);
__decorate([
    Post('{townID}/conversationArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createConversationArea", null);
__decorate([
    Post('{townID}/votingArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createVotingArea", null);
__decorate([
    Post('{townID}/viewingArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createViewingArea", null);
TownsController = __decorate([
    Route('towns'),
    Tags('towns')
], TownsController);
export { TownsController };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bnNDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxNQUFNLEVBQ04sS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEdBQ0wsTUFBTSxNQUFNLENBQUM7QUFHZCxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBZ0J6QyxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLFVBQVU7SUFDckMsV0FBVyxHQUFvQixlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7SUFReEQsQUFBTixLQUFLLENBQUMsU0FBUztRQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQVdZLEFBQU4sS0FBSyxDQUFDLFVBQVUsQ0FBUyxPQUF5QjtRQUN2RCxNQUFNLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FDdEUsT0FBTyxDQUFDLFlBQVksRUFDcEIsT0FBTyxDQUFDLGdCQUFnQixFQUN4QixPQUFPLENBQUMsT0FBTyxDQUNoQixDQUFDO1FBQ0YsT0FBTztZQUNMLE1BQU07WUFDTixrQkFBa0I7U0FDbkIsQ0FBQztJQUNKLENBQUM7SUFXWSxBQUFOLEtBQUssQ0FBQyxVQUFVLENBQ2IsTUFBYyxFQUNVLGtCQUEwQixFQUNsRCxXQUErQjtRQUV2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVB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