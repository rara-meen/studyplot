import React from "react";
import PageHeader from "./PageHeader";
import Card from "./Card";
import EmptyState from "./EmptyState";

const PlaceholderPage = ({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
}) => {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
    </div>
  );
};

export default PlaceholderPage;
