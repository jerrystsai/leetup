import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import SplashFeature from "../SplashFeature";
import splashData from './data.json'

const { title: showcaseTitle, copy: showcaseCopy, imageUrl: showcaseImageUrl } = splashData.showcase;
const { headline: explainTitle, copy: explainCopy } = splashData.explain;
const features = splashData.features;
const { imageUrl: seeGroupsImageUrl, relUrl: seeGroupsRelUrl, headline: seeGroupsHeadline, copy: seeGroupsCopy } = splashData.feature.seeGroups;
const { imageUrl: findEventImageUrl, relUrl: findEventRelUrl, headline: findEventHeadline, copy: findEventCopy } = splashData.feature.findEvent;
const { imageUrl: startGroupImageUrl, relUrl: startGroupRelUrl, headline: startGroupHeadline, copy: startGroupCopy } = splashData.feature.startGroup;

console.log('splashData -- ', seeGroupsImageUrl, seeGroupsHeadline, seeGroupsCopy);

const Splash = ( { isLoaded } ) => {

  return (
    <>
      <div className="showcase">
        <div className="showcase-title">{showcaseTitle}</div>
        <div className="showcase-copy">{showcaseCopy}</div>
        <div className="showcase-image"><img src={showcaseImageUrl} alt={showcaseTitle} /></div>
      </div>
      <div className="explain">
        <div className="explain-headline">How Leetup Works</div>
        <div className="explain-copy">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</div>
      </div>
      <div className="features">
        <div className="feature-see-groups"><SplashFeature imageUrl={seeGroupsImageUrl} relUrl={seeGroupsRelUrl} headline={seeGroupsHeadline} copy={seeGroupsCopy} /></div>
        <div className="feature-find-event"><SplashFeature imageUrl={findEventImageUrl} relUrl={findEventRelUrl} headline={findEventHeadline} copy={findEventCopy} /></div>
        <div className="feature-start-group"><SplashFeature imageUrl={startGroupImageUrl} relUrl={startGroupRelUrl} headline={startGroupHeadline} copy={startGroupCopy} userToggle={true} /></div>
      </div>
      <div className="cta">
        <button>Join Meetup</button>
      </div>
    </>
  );
}

export default Splash;
