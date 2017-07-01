#!/usr/bin/python
import socket, threading, time, base64, hashlib, struct, binascii
import json
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import uuid

class Signal(WebSocket):

	def handleMessage(self):
		global rooms
		global peers
		global peer_id_server 

		try:
			message = json.loads(self.data)

			if 'sessionDescriptionProtocol' in message or 'candidate' in message:
				try:
					print("initiating session")
					print(message["sendTo"])
					print(message["peerID"])
					room_index = next(rooms.index(room) for room in rooms if room['roomID'] == message['senderID'])
					peer_id = next(rooms[room_index]['peers'].index(peer) for peer in rooms[room_index]['peers'] if peer['client_id'] == message['peerID'])
					new_message = '{"signalConnection": "true", "server_id": '+str(peer_id)+', '
					send_to = message["sendTo"]
					rooms[room_index]["peers"][send_to]["peer_self"].sendMessage(new_message+str(self.data)[1:])
				except Exception as e:
					print("exception" + e)
			elif 'addPeer' in message:
				peer_id_client = message["peerID"]
				room_index = next(rooms.index(room) for room in rooms if room['roomID'] == message['roomID'])
				print(room_index)
				peer_id_server = 0 # if the user is hosting the room,rooms[room_index]["peers"] is not an array
				if len(rooms[room_index]["peers"]) > 0: # executing the below lines only if the peer is not a host
					peer_id_server = rooms[room_index]["peers"][-1]["server_id"] + 1
				rooms[room_index]["peers"].append({"client_id": peer_id_client, "server_id": peer_id_server, "peer_self": ""}) # for the time being I am appending the client id of peer to the index of that peer in the array on server
				rooms[room_index]["peer_id_list"].append(peer_id_server)
				rooms[room_index]["peers"][peer_id_server]["peer_self"] = self
				rooms[room_index]["peers"][peer_id_server]["peer_self"].sendMessage(str('{"peer_id_list": '+str(rooms[room_index]["peer_id_list"])+'}'))
				rooms[room_index]["peers"][0]["peer_self"].sendMessage(str('{"newPeer": "true", "server_id": '+str(peer_id_server)+'}'))
				# peer_id_server+=1
				print(rooms)
			elif 'addRoom' in message:
				rooms.append({"roomID": message["roomID"], "peers": [], "peer_id_list": []})
				print(rooms)
			elif 'verifyRoom' in message:
				print("starting verification")
				room_index = next(rooms.index(room) for room in rooms if room['roomID'] == message['roomID'])
				print("verification in progress")
				if room_index is not None:
					self.sendMessage(str('{"roomExists": "true"}'))
				else:
					self.sendMessage(str('{"roomExists": "false"}')) 
		except Exception as e:
			print(e)

	# to be decided if the peer id should be generated on the client side or the server side
	def handleConnected(self):
		global next_peer
		global rooms

		try:
			print("connected")
			self.sendMessage(str('{"message": "You are connected to the virtual room"}'))
		except Exception as e:
			print(e)
		# self.sendMessage({"peerID": uuid.uuid4(), "generatePeerID": True})

	def handleClosed(self):
		print("disconnect")
		rooms[room_index]["peers"].remove(rooms[room_index]["peers"].index(self))

if __name__ == '__main__':
	rooms = []
	peer_id_server = 0
	server = SimpleWebSocketServer('', 8000, Signal)
	server.serveforever()
