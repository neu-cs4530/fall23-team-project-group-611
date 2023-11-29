import { nanoid } from 'nanoid';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isViewingArea } from '../TestUtils';
import { logError } from '../Utils';
import ConversationArea from './ConversationArea';
import GameAreaFactory from './games/GameAreaFactory';
import ViewingArea from './ViewingArea';
import VotingArea from './VotingArea';
export default class Town {
    get capacity() {
        return this._capacity;
    }
    set isPubliclyListed(value) {
        this._isPubliclyListed = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { isPubliclyListed: value });
    }
    get isPubliclyListed() {
        return this._isPubliclyListed;
    }
    get townUpdatePassword() {
        return this._townUpdatePassword;
    }
    get players() {
        return this._players;
    }
    get occupancy() {
        return this.players.length;
    }
    get friendlyName() {
        return this._friendlyName;
    }
    set friendlyName(value) {
        this._friendlyName = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { friendlyName: value });
    }
    get townID() {
        return this._townID;
    }
    get interactables() {
        return this._interactables;
    }
    _players = [];
    _videoClient = TwilioVideo.getInstance();
    _interactables = [];
    _townID;
    _friendlyName;
    _townUpdatePassword;
    _isPubliclyListed;
    _capacity;
    _broadcastEmitter;
    _connectedSockets = new Set();
    constructor(friendlyName, isPubliclyListed, townID, broadcastEmitter) {
        this._townID = townID;
        this._capacity = 50;
        this._townUpdatePassword = nanoid(24);
        this._isPubliclyListed = isPubliclyListed;
        this._friendlyName = friendlyName;
        this._broadcastEmitter = broadcastEmitter;
    }
    async addPlayer(userName, socket) {
        const newPlayer = new Player(userName, socket.to(this._townID));
        this._players.push(newPlayer);
        this._connectedSockets.add(socket);
        newPlayer.videoToken = await this._videoClient.getTokenForTown(this._townID, newPlayer.id);
        this._broadcastEmitter.emit('playerJoined', newPlayer.toPlayerModel());
        socket.on('disconnect', () => {
            this._removePlayer(newPlayer);
            this._connectedSockets.delete(socket);
        });
        socket.on('chatMessage', (message) => {
            this._broadcastEmitter.emit('chatMessage', message);
        });
        socket.on('playerMovement', (movementData) => {
            this._updatePlayerLocation(newPlayer, movementData);
        });
        socket.on('interactableUpdate', (update) => {
            if (isViewingArea(update)) {
                newPlayer.townEmitter.emit('interactableUpdate', update);
                const viewingArea = this._interactables.find(eachInteractable => eachInteractable.id === update.id);
                if (viewingArea) {
                    viewingArea.updateModel(update);
                }
            }
        });
        socket.on('interactableCommand', (command) => {
            const interactable = this._interactables.find(eachInteractable => eachInteractable.id === command.interactableID);
            if (interactable) {
                try {
                    const payload = interactable.handleCommand(command, newPlayer);
                    socket.emit('commandResponse', {
                        commandID: command.commandID,
                        interactableID: command.interactableID,
                        isOK: true,
                        payload,
                    });
                }
                catch (err) {
                    if (err instanceof InvalidParametersError) {
                        socket.emit('commandResponse', {
                            commandID: command.commandID,
                            interactableID: command.interactableID,
                            isOK: false,
                            error: err.message,
                        });
                    }
                    else {
                        logError(err);
                        socket.emit('commandResponse', {
                            commandID: command.commandID,
                            interactableID: command.interactableID,
                            isOK: false,
                            error: 'Unknown error',
                        });
                    }
                }
            }
            else {
                socket.emit('commandResponse', {
                    commandID: command.commandID,
                    interactableID: command.interactableID,
                    isOK: false,
                    error: `No such interactable ${command.interactableID}`,
                });
            }
        });
        return newPlayer;
    }
    _removePlayer(player) {
        if (player.location.interactableID) {
            this._removePlayerFromInteractable(player);
        }
        this._players = this._players.filter(p => p.id !== player.id);
        this._broadcastEmitter.emit('playerDisconnect', player.toPlayerModel());
    }
    _updatePlayerLocation(player, location) {
        const prevInteractable = this._interactables.find(conv => conv.id === player.location.interactableID);
        if (!prevInteractable?.contains(location)) {
            if (prevInteractable) {
                prevInteractable.remove(player);
            }
            const newInteractable = this._interactables.find(eachArea => eachArea.isActive && eachArea.contains(location));
            if (newInteractable) {
                newInteractable.add(player);
            }
            location.interactableID = newInteractable?.id;
        }
        else {
            location.interactableID = prevInteractable.id;
        }
        player.location = location;
        this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
    }
    _removePlayerFromInteractable(player) {
        const area = this._interactables.find(eachArea => eachArea.id === player.location.interactableID);
        if (area) {
            area.remove(player);
        }
    }
    addConversationArea(conversationArea) {
        const area = this._interactables.find(eachArea => eachArea.id === conversationArea.id);
        if (!area || !conversationArea.topic || area.topic) {
            return false;
        }
        area.topic = conversationArea.topic;
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    addVotingArea(votingArea) {
        const area = this._interactables.find(eachArea => eachArea.id === votingArea.id);
        if (!area || !votingArea.votes || area.votes) {
            return false;
        }
        area.votes = votingArea.votes;
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    addViewingArea(viewingArea) {
        const area = this._interactables.find(eachArea => eachArea.id === viewingArea.id);
        if (!area || !viewingArea.video || area.video) {
            return false;
        }
        area.updateModel(viewingArea);
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    getPlayerBySessionToken(token) {
        return this.players.find(eachPlayer => eachPlayer.sessionToken === token);
    }
    getInteractable(id) {
        const ret = this._interactables.find(eachInteractable => eachInteractable.id === id);
        if (!ret) {
            throw new Error(`No such interactable ${id}`);
        }
        return ret;
    }
    disconnectAllPlayers() {
        this._broadcastEmitter.emit('townClosing');
        this._connectedSockets.forEach(eachSocket => eachSocket.disconnect(true));
    }
    initializeFromMap(map) {
        const objectLayer = map.layers.find(eachLayer => eachLayer.name === 'Objects');
        if (!objectLayer) {
            throw new Error(`Unable to find objects layer in map`);
        }
        const viewingAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ViewingArea')
            .map(eachViewingAreaObject => ViewingArea.fromMapObject(eachViewingAreaObject, this._broadcastEmitter));
        const conversationAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ConversationArea')
            .map(eachConvAreaObj => ConversationArea.fromMapObject(eachConvAreaObj, this._broadcastEmitter));
        const votingAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'VotingArea')
            .map(eachConvAreaObj => VotingArea.fromMapObject(eachConvAreaObj, this._broadcastEmitter));
        const gameAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'GameArea')
            .map(eachGameAreaObj => GameAreaFactory(eachGameAreaObj, this._broadcastEmitter));
        this._interactables = this._interactables
            .concat(viewingAreas)
            .concat(conversationAreas)
            .concat(votingAreas)
            .concat(gameAreas);
        this._validateInteractables();
    }
    _validateInteractables() {
        const interactableIDs = this._interactables.map(eachInteractable => eachInteractable.id);
        if (interactableIDs.some(item => interactableIDs.indexOf(item) !== interactableIDs.lastIndexOf(item))) {
            throw new Error(`Expected all interactable IDs to be unique, but found duplicate interactable ID in ${interactableIDs}`);
        }
        for (const interactable of this._interactables) {
            for (const otherInteractable of this._interactables) {
                if (interactable !== otherInteractable && interactable.overlaps(otherInteractable)) {
                    throw new Error(`Expected interactables not to overlap, but found overlap between ${interactable.id} and ${otherInteractable.id}`);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUVoQyxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBRW5FLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBYzdDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLGVBQWUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFDO0FBTXRDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sSUFBSTtJQUN2QixJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksZ0JBQWdCLENBQUMsS0FBYztRQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFlBQVksQ0FBQyxLQUFhO1FBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUdPLFFBQVEsR0FBYSxFQUFFLENBQUM7SUFHeEIsWUFBWSxHQUFpQixXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFdkQsY0FBYyxHQUF1QixFQUFFLENBQUM7SUFFL0IsT0FBTyxDQUFTO0lBRXpCLGFBQWEsQ0FBUztJQUViLG1CQUFtQixDQUFTO0lBRXJDLGlCQUFpQixDQUFVO0lBRTNCLFNBQVMsQ0FBUztJQUVsQixpQkFBaUIsQ0FBc0Q7SUFFdkUsaUJBQWlCLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFNUQsWUFDRSxZQUFvQixFQUNwQixnQkFBeUIsRUFDekIsTUFBYyxFQUNkLGdCQUFxRTtRQUVyRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7SUFDNUMsQ0FBQztJQVFELEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBZ0IsRUFBRSxNQUF1QjtRQUN2RCxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBR25DLFNBQVMsQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUczRixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUt2RSxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDaEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFJSCxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBNEIsRUFBRSxFQUFFO1lBQzNELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFRSCxNQUFNLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQ3ZELElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN6QixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDekQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQzFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsQ0FDdEQsQ0FBQztnQkFDRixJQUFJLFdBQVcsRUFBRTtvQkFDZCxXQUEyQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDbEQ7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBSUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE9BQXNELEVBQUUsRUFBRTtZQUMxRixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FDM0MsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsY0FBYyxDQUNuRSxDQUFDO1lBQ0YsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLElBQUk7b0JBQ0YsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQy9ELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQzdCLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUzt3QkFDNUIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO3dCQUN0QyxJQUFJLEVBQUUsSUFBSTt3QkFDVixPQUFPO3FCQUNSLENBQUMsQ0FBQztpQkFDSjtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDWixJQUFJLEdBQUcsWUFBWSxzQkFBc0IsRUFBRTt3QkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs0QkFDN0IsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTOzRCQUM1QixjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7NEJBQ3RDLElBQUksRUFBRSxLQUFLOzRCQUNYLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTzt5QkFDbkIsQ0FBQyxDQUFDO3FCQUNKO3lCQUFNO3dCQUNMLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFOzRCQUM3QixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7NEJBQzVCLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYzs0QkFDdEMsSUFBSSxFQUFFLEtBQUs7NEJBQ1gsS0FBSyxFQUFFLGVBQWU7eUJBQ3ZCLENBQUMsQ0FBQztxQkFDSjtpQkFDRjthQUNGO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQzdCLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztvQkFDNUIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO29CQUN0QyxJQUFJLEVBQUUsS0FBSztvQkFDWCxLQUFLLEVBQUUsd0JBQXdCLE9BQU8sQ0FBQyxjQUFjLEVBQUU7aUJBQ3hELENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBT08sYUFBYSxDQUFDLE1BQWM7UUFDbEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtZQUNsQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBWU8scUJBQXFCLENBQUMsTUFBYyxFQUFFLFFBQXdCO1FBQ3BFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQy9DLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FDbkQsQ0FBQztRQUVGLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDekMsSUFBSSxnQkFBZ0IsRUFBRTtnQkFFcEIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQzlDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUM3RCxDQUFDO1lBQ0YsSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDN0I7WUFDRCxRQUFRLENBQUMsY0FBYyxHQUFHLGVBQWUsRUFBRSxFQUFFLENBQUM7U0FDL0M7YUFBTTtZQUNMLFFBQVEsQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1NBQy9DO1FBRUQsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQVFPLDZCQUE2QixDQUFDLE1BQWM7UUFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQ25DLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FDM0QsQ0FBQztRQUNGLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFtQk0sbUJBQW1CLENBQUMsZ0JBQXVDO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUNuQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQUssZ0JBQWdCLENBQUMsRUFBRSxDQUM1QixDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNsRCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7UUFDcEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQW1CTSxhQUFhLENBQUMsVUFBMkI7UUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxFQUFFLENBQWUsQ0FBQztRQUMvRixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQzVDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQW1CTSxjQUFjLENBQUMsV0FBNkI7UUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQ25DLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUM1QixDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDN0MsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVFNLHVCQUF1QixDQUFDLEtBQWE7UUFDMUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQVNNLGVBQWUsQ0FBQyxFQUFVO1FBQy9CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFNTSxvQkFBb0I7UUFDekIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFrQk0saUJBQWlCLENBQUMsR0FBYztRQUNyQyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDakMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FDbEIsQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUN4RDtRQUNELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxPQUFPO2FBQ3JDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDO2FBQ3ZELEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQzNCLFdBQVcsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQ3pFLENBQUM7UUFFSixNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxPQUFPO2FBQzFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUM7YUFDNUQsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQ3JCLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQ3hFLENBQUM7UUFFSixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTzthQUNwQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQzthQUN0RCxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRTdGLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxPQUFPO2FBQ2xDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDO2FBQ3BELEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUVwRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjO2FBQ3RDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDcEIsTUFBTSxDQUFDLGlCQUFpQixDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxXQUFXLENBQUM7YUFDbkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFTyxzQkFBc0I7UUFFNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pGLElBQ0UsZUFBZSxDQUFDLElBQUksQ0FDbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQzVFLEVBQ0Q7WUFDQSxNQUFNLElBQUksS0FBSyxDQUNiLHNGQUFzRixlQUFlLEVBQUUsQ0FDeEcsQ0FBQztTQUNIO1FBRUQsS0FBSyxNQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzlDLEtBQUssTUFBTSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNuRCxJQUFJLFlBQVksS0FBSyxpQkFBaUIsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7b0JBQ2xGLE1BQU0sSUFBSSxLQUFLLENBQ2Isb0VBQW9FLFlBQVksQ0FBQyxFQUFFLFFBQVEsaUJBQWlCLENBQUMsRUFBRSxFQUFFLENBQ2xILENBQUM7aUJBQ0g7YUFDRjtTQUNGO0lBQ0gsQ0FBQztDQUNGIn0=