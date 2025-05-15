import React from "react";

const DataDeletion = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Policy</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Your Data Rights</h2>
          <p>
            As a user of Facebook Auto Poster, you have complete control over
            your data. This page explains how you can request data deletion and
            what happens to your information when you do so.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">What Data We Store</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your Facebook account information</li>
            <li>Facebook page access tokens</li>
            <li>Scheduled posts and content</li>
            <li>User preferences and settings</li>
            <li>Usage statistics and logs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            How to Delete Your Data
          </h2>
          <p>You can delete your data in several ways:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Through your account settings</li>
            <li>By revoking Facebook permissions</li>
            <li>By contacting the developer directly</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            What Happens When You Delete
          </h2>
          <p>When you request data deletion:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All your personal information is removed from our servers</li>
            <li>Facebook access tokens are revoked</li>
            <li>Scheduled posts are cancelled</li>
            <li>Account is permanently deactivated</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
          <p>
            We retain your data only for as long as necessary to provide the
            service. Once you request deletion, we will remove your data within
            30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Backup Data</h2>
          <p>
            Any backup copies of your data will also be deleted within 30 days
            of your deletion request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact</h2>
          <p>
            If you have any questions about data deletion or need assistance,
            please contact the developer directly.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DataDeletion;
