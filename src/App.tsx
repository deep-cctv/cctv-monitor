import { Authorizer } from "./ui/screen/Authorizer";
import { Monitor } from "./ui/screen/Monitor";

export const App = () => {
  return (
    <Authorizer>
      <Monitor />
    </Authorizer>
  );
};
