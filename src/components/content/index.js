import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import serverConfig from "./../../config/server";
import { convertLinksOpenInNewWindow } from "./../../utils/link";

require('./index.scss');


@connect((store) => {
  return {
    localization: store.localization,
    post: store.post,
    window: store.window,
  }
})
export default class Content extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    setTimeout(function() {
      convertLinksOpenInNewWindow(ReactDom.findDOMNode(this.refs['content']));
    }.bind(this), 100);
  }
  handleToggleLibrary(value, event) {
    if (this.props.window.size[0] < 1024) {
      // if (this.props.window.openLibrary == false && value == false) {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: true});
      // } else if (this.props.window.openLibrary == true && value == true) {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: false});
      // } else {
      //   this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: value});
      // }
      this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: value});
      const page2 = ReactDom.findDOMNode(this.refs['page-2']);
      page2.scrollTop = 0;
    }
  }
  handleOpenLibrary(event) {
    this.props.dispatch({type: "PUSH_ROUTE", payload: "RESEARCH"});
    setTimeout(function() {
      this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: true});
    }.bind(this), 500);
  }
  handleCloseLibrary(event) {
    this.props.dispatch({type: "SET_OPEN_LIBRARY", payload: false});
  }
  handleClickResearchItem(item, event) {
    this.props.dispatch({type: "SET_RESEARCH_ITEM", payload: item});
  }
  render() {
    const { localization } = this.props.localization;
    const { posts } = this.props.post;
    const { window } = this.props;

    const about = posts.map((item, index) => {
      if (item.categories.length > 0 && item.categories.indexOf(serverConfig.iAbout) > -1)  {
        return <div className="post" key={"about-" + index} dangerouslySetInnerHTML={{__html: item.content.rendered}} />;
      }
      return null;
    });

    const news = posts.map((item, index) => {
      if (item.categories.length > 0 && item.categories.indexOf(serverConfig.iNews) > -1)  {
        return <div className="post" key={"news-" + index} dangerouslySetInnerHTML={{__html: item.content.rendered}} />;
      }
      return null;
    });

    const researches = posts.map((item, index) => {
      if (item.categories.length > 0 && item.categories.indexOf(serverConfig.iResearch) > -1)  {
        return <li className="post" key={"research-" + index}>
          <div dangerouslySetInnerHTML={{__html: item.title.rendered}} onClick={this.handleClickResearchItem.bind(this, item)}/>
        </li>;
      }
      return null;
    });

    let page1Top, page2Right;
    let openLibrary = " hide";
    let openNews = "";
    if (window.openLibrary) {
      openLibrary = "";
      openNews = " hide";
    }
    if (window.researchItem) {
      page1Top = <div className="top research-back" onClick={this.handleClickResearchItem.bind(this, null)}>
        Back to list
      </div>;
      page2Right = <div className={"right" + openLibrary}>
        <div className="top" onClick={this.handleToggleLibrary.bind(this, true)}>
          <div dangerouslySetInnerHTML={{__html: window.researchItem.title.rendered}} />
        </div>
        <div className="middle">
          <div className="container text">
            <div dangerouslySetInnerHTML={{__html: window.researchItem.content.rendered}} />
          </div>
        </div>
        <div className="bottom">
          <div className="button" onClick={this.handleClickResearchItem.bind(this, null)}>
            Back to list
          </div>
        </div>
      </div>;
    } else {
      page1Top = <div className="top" onClick={this.handleToggleLibrary.bind(this, false)}>
        SOMA News
      </div>;
      page2Right = <div className={"right" + openLibrary}>
        <div className="top" onClick={this.handleToggleLibrary.bind(this, true)}>
          SOMA Research
        </div>
        <div className="middle">
          <ul className="container">
            { researches }
          </ul>
        </div>
        <div className="bottom">
          <div className="button" onClick={this.handleCloseLibrary.bind(this)}>
            Leave SOMA library
          </div>
        </div>
      </div>;
    }


    return(
      <div ref="content" className="content">
        <div className="page page-1">
          <div className="left">
            <div className="title">
              <span>S</span><img className="logo" src="./kids.png" /><span>MA</span>
            </div>
            <div className="sitename">
              Somatic Engagement
            </div>
            <div className="description">
              This site explores new ways of thinking<br/>about how children play digital games
            </div>
          </div>
          <div ref="post-about" className="right">
            <div className="container">
              { about }
            </div>
          </div>
        </div>
        <div ref="page-2" className="page page-2">
          <div className="button-library" onClick={this.handleOpenLibrary.bind(this)}>
          </div>
          <div className={"left" + openNews}>
            { page1Top }
            <div className="bottom">
              <div className="container">
                { news }
              </div>
            </div>
          </div>
          { page2Right }
        </div>
        <div className="page page-3">
        </div>
        <div className="page page-4">
        </div>

      </div>
    );
  }
}

// <div className="content" dangerouslySetInnerHTML={{__html: localization.homepagecontent}} />
