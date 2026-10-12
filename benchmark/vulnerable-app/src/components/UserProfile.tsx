import React from 'react';

export function UserBio(props: { rawBioHtml: string }) {
  // Vulnerability 6: React dangerouslySetInnerHTML without DOMPurify
  return (
    <div className="user-bio">
      <h3>User Bio</h3>
      <div dangerouslySetInnerHTML={{ __html: props.rawBioHtml }} />
    </div>
  );
}
