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

			if 'sdp' in message or 'candidate' in message:
				try:
					peer_id = next(rooms["peers"].index(peer) for peer in rooms["peers"] if rooms["peers"]["peer_id_client"] == message['peerID'])
					rooms[room_index]["peers"][peer_id][peer_self].sendMessage(str(message))
				except Exception as e:
					print("exception" + e)
			elif 'addPeer' in message:
				peer_id_client = message["peerID"]
				room_index = next(rooms.index(room) for room in rooms if room['roomID'] == message['roomID'])
				print(room_index)
				peer_id_server = len(rooms[room_index]["peers"])
				rooms[room_index]["peers"].append({"client_id": peer_id_client, "server_id": peer_id_server, "peer_self": ""}) # for the time being I am appending the client id of peer to the index of that peer in the array on server
				rooms[room_index]["peers"][peer_id_server]["peer_self"] = self
				peer_id_server+=1
				print(rooms)
			elif 'addRoom' in message:
				rooms.append({"roomID": message["roomID"], "peers": []})
				print(rooms)
			elif 'verifyRoom' in message:
				room_index = next(rooms.index(room) for room in rooms if rooms["roomID"] == message["roomID"])
				if not room_index is None:
					self.sendMessage({"roomExists": "true"})
				else:
					self.sendMessage({"roomExists": "false"}) 
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
