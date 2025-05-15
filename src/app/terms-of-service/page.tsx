"use client";

import React from "react";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Facebook Auto Poster, you agree to be bound
            by these Terms of Service. This is a personal project designed for
            individual use.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            2. Description of Service
          </h2>
          <p>Facebook Auto Poster is a tool that allows you to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Schedule and automate posts to your Facebook pages</li>
            <li>Manage multiple Facebook pages</li>
            <li>Create and schedule content in advance</li>
            <li>Monitor post performance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            3. User Responsibilities
          </h2>
          <p>As a user of this service, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Comply with Facebook&apos;s Terms of Service and Community
              Guidelines
            </li>
            <li>Use the service responsibly and ethically</li>
            <li>
              Not engage in spam or automated posting that violates
              Facebook&apos;s policies
            </li>
            <li>Maintain the security of your account credentials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            4. Service Limitations
          </h2>
          <p>
            This service is provided &quot;as is&quot; and may have limitations
            including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Facebook API rate limits</li>
            <li>Service availability and maintenance windows</li>
            <li>
              Feature limitations based on Facebook&apos;s API capabilities
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            5. Intellectual Property
          </h2>
          <p>
            All content you post through the service remains your property. You
            retain all rights to your content while granting necessary
            permissions for the service to function.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Disclaimer</h2>
          <p>
            This service is provided for personal use only. We make no
            warranties about the service&apos;s reliability, availability, or
            suitability for any particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact</h2>
          <p>
            For questions about these terms, please contact the developer
            directly.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
