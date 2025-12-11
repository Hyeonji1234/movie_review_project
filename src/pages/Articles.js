import React from 'react';
import './Articles.css';

const Articles = () => {
  return (
    <div className="articles-page">
      <div className="container">
        <h1 className="page-title">영화 기사</h1>
        <div className="coming-soon">
          <p>곧 제공될 예정입니다.</p>
          <p>영화 관련 최신 기사와 뉴스를 확인하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default Articles;
