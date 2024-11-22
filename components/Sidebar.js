// components/Sidebar.js

import React, { useState } from 'react';
import Draggable from 'react-draggable';
import Overlay from './Overlay';

const Sidebar = ({
  currentProtocol,
  setCurrentProtocol,
  protocols,
  setProtocols,
}) => {
  const [overlayContent, setOverlayContent] = useState(null);

  const openOverlay = (type) => {
    setOverlayContent(type);
  };

  const closeOverlay = () => {
    setOverlayContent(null);
  };

  return (
    currentProtocol && (
      <Draggable handle=".draggable-bar">
        <div className="sidebar">
          <div className="draggable-bar">Options</div>
          <button onClick={() => openOverlay('newCompound')}>New Compound</button>
          <button onClick={() => openOverlay('addCompound')}>Add Compound</button>
          <button onClick={() => openOverlay('compoundIndex')}>
            Compound Index
          </button>

          {/* Overlay Windows */}
          {overlayContent && (
            <Overlay
              type={overlayContent}
              closeOverlay={closeOverlay}
              protocol={currentProtocol}
              setProtocol={setCurrentProtocol}
            />
          )}

          {/* Compound List */}
          {currentProtocol && (
            <div className="compound-list">
              {currentProtocol.compounds.map((compound, index) => (
                <div key={index} className="compound-item">
                  <span>{compound.name}</span>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(`Remove ${compound.name} from the protocol?`)
                      ) {
                        const updatedCompounds = currentProtocol.compounds.filter(
                          (c, i) => i !== index
                        );
                        setCurrentProtocol({
                          ...currentProtocol,
                          compounds: updatedCompounds,
                        });
                      }
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Draggable>
    )
  );
};

export default Sidebar;
