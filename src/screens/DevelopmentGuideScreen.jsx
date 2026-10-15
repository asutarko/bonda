// The previous Development & Behaviour Guide lives in DevelopmentGuideScreen.backup.jsx.
import BondaDevelopment from "../components/BondaDevelopment";

export function DevelopmentGuideScreen({ childCtx, push }) {
  return <BondaDevelopment childCtx={childCtx} onAddChild={() => push("addChild")} />;
}
