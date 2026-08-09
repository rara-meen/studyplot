import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Button from "../../components/shared/Button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-semibold text-brand-primary">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-ink-muted dark:text-ink-dark-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Button as={Link} to="/" className="mt-8">
        <FiArrowLeft />
        Back to home
      </Button>
    </div>
  );
};

export default NotFound;
