import React from "react";

type Props = {
  widgetId: string;
};

const WebsiteWidget = ({ widgetId }: Props) => {
  // récupère les données selon le widgetId...
  return (
    <div style={{ backgroundColor: "white", height: "100%", width: "100%" }}>
      Ton widget avec l’agent ici...
    </div>
  );
};

export default WebsiteWidget;
