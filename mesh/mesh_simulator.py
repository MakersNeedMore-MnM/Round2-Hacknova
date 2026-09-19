from node import MeshNode


def build_network():
    survivor = MeshNode("SURVIVOR-01", "survivor")
    relay = MeshNode("RELAY-01", "relay")
    rescuer = MeshNode("RESCUER-01", "rescuer")
    coordinator = MeshNode("CONTROL-01", "coordinator")

    survivor.connect(relay)
    relay.connect(survivor)
    relay.connect(rescuer)
    rescuer.connect(relay)
    rescuer.connect(coordinator)
    coordinator.connect(rescuer)

    return survivor, relay, rescuer, coordinator


def send_message(source, target, message):
    visited = set()

    def route(node):
        if node.node_id in visited:
            return False

        visited.add(node.node_id)

        if node.node_id == target.node_id:
            node.receive(message)
            return True

        for neighbor in node.neighbors:
            if route(neighbor):
                return True

        return False

    return route(source)


if __name__ == "__main__":

    survivor, relay, rescuer, coordinator = build_network()

    message = {
        "type": "SOS",
        "incident_id": "SOS-001",
        "priority": "CRITICAL"
    }

    success = send_message(
        survivor,
        coordinator,
        message
    )

    print("Message delivered:", success)