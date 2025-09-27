import React from "react";

type Props = {
  widgetId: string;
};

const WebsiteWidget = ({ widgetId }: Props) => {
   
  return (
    <div style={{ backgroundColor: "white", height: "100%", width: "100%" }}>
      Your widget with the agent here...
    </div>
  );
}; 

export default WebsiteWidget;
