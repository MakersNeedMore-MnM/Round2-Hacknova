class MeshNode:

    def __init__(self, node_id, node_type):
        self.node_id = node_id
        self.node_type = node_type
        self.neighbors = []

    def connect(self, node):
        if node not in self.neighbors:
            self.neighbors.append(node)

    def receive(self, message):
        print(
            f"[{self.node_id}] received message: "
            f"{message}"
        )