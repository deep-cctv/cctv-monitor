import { createSignal, For, onMount } from "solid-js";

import { token } from "../../service/signal/token";

type Client = {
  name: string;
  uri: string;
};

const Video = (props: Client) => {
  return (
    <div>
      <video
        autoplay
        playsinline
        src={`${import.meta.env.VITE_APP_API_URL}/${props.uri}`}
      />
      <p>{props.name}</p>
    </div>
  );
};

export const Monitor = () => {
  const [clients, setClients] = createSignal<Client[]>([]);
  onMount(() => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_APP_API_URL}/monitor?token=${token()}`
    );
    ws.onerror = (error) => {
      console.log(`WebSocket error, ${JSON.stringify(error)}`);
    };
    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.onmessage = (event) => {
      const client = JSON.parse(event.data) as Client;
      if (clients().some((c) => c.name === client.name)) {
        setClients((prev) =>
          prev.map((c) => (c.name === client.name ? client : c))
        );
      } else {
        setClients((prev) => [...prev, client]);
      }
    };
  });
  return (
    <div class="grid-cols-3 grid">
      <For each={clients()}>
        {(client) => <Video name={client.name} uri={client.uri} />}
      </For>
    </div>
  );
};
