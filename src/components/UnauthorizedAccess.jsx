// Components/UnauthorizedAccess.jsx
import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router";

const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-100 p-4 flex items-center justify-center">
      <Result
        status="403"
        title="Access Denied"
        subTitle={`Only the creator can manage documents for this search box`}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      />
    </div>
  );
};

export default UnauthorizedAccess;
