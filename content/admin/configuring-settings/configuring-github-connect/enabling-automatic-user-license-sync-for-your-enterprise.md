---
title: Enabling automatic user license sync for your enterprise
intro: 'You can manage license usage across your {% data variables.product.prodname_enterprise %} environments by automatically syncing user licenses from {% data variables.location.product_location %} to {% data variables.product.prodname_ghe_cloud %}.'
redirect_from:
  - /enterprise/admin/installation/enabling-automatic-user-license-sync-between-github-enterprise-server-and-github-enterprise-cloud
  - /enterprise/admin/configuration/enabling-automatic-user-license-sync-between-github-enterprise-server-and-github-enterprise-cloud
  - /admin/configuration/enabling-automatic-user-license-sync-between-github-enterprise-server-and-github-enterprise-cloud
  - /admin/configuration/managing-connections-between-github-enterprise-server-and-github-enterprise-cloud/enabling-automatic-user-license-sync-between-github-enterprise-server-and-github-enterprise-cloud
  - /admin/configuration/managing-connections-between-your-enterprise-accounts/enabling-automatic-user-license-sync-between-github-enterprise-server-and-github-enterprise-cloud
  - /admin/configuration/configuring-github-connect/enabling-automatic-user-license-sync-for-your-enterprise
permissions: Enterprise owners can enable automatic user license synchronization.
versions:
  ghes: '*'
type: how_to
topics:
  - Enterprise
  - GitHub Connect
  - Licensing
shortTitle: Automatic user license sync
---
## About automatic license synchronization

{% data reusables.enterprise-licensing.unique-user-licensing-model %}

{% data reusables.enterprise-licensing.about-license-sync %} For more information, see [AUTOTITLE](/admin/configuration/configuring-github-connect/about-github-connect#data-transmission).

If you enable automatic user license sync for your enterprise, every week, {% data variables.product.prodname_github_connect %} will automatically synchronize license usage between {% data variables.product.prodname_ghe_server %} and your enterprise on {% data variables.product.prodname_dotcom_the_website %}{% ifversion ghecom-license-sync %} or {% data variables.enterprise.data_residency_site %}{% endif %}. You can also synchronize your license data at any time outside of the automatic weekly sync, by manually triggering a license sync job. For more information, see [AUTOTITLE](/billing/managing-your-license-for-github-enterprise/syncing-license-usage-between-github-enterprise-server-and-github-enterprise-cloud#triggering-a-license-sync-job).

If you use multiple {% data variables.product.prodname_ghe_server %} instances, you can enable automatic license sync between each of your instances and the same enterprise account on {% data variables.product.prodname_ghe_cloud %}.

{% data reusables.enterprise-licensing.view-consumed-licenses %}

You can also manually upload {% data variables.product.prodname_ghe_server %} user license information to {% data variables.product.prodname_ghe_cloud %}. For more information, see [AUTOTITLE](/billing/managing-your-license-for-github-enterprise/syncing-license-usage-between-github-enterprise-server-and-github-enterprise-cloud).

{% data reusables.enterprise-licensing.verified-domains-license-sync %}

## Enabling license synchronization

Before enabling license synchronization on {% data variables.location.product_location %}, you must enable {% data variables.product.prodname_github_connect %}. See {% ifversion ghecom-license-sync %}[AUTOTITLE](/admin/configuring-settings/configuring-github-connect/enabling-github-connect-for-ghecom) or {% endif %}[AUTOTITLE](/admin/configuring-settings/configuring-github-connect/enabling-github-connect-for-githubcom).

{% data reusables.enterprise-accounts.access-enterprise %}
{% data reusables.enterprise-accounts.github-connect-tab %}
1. To the right of "License sync", click **Enable**.

   ![Screenshot of the "License sync" option on the GitHub Connect page. The "Enable" button is highlighted with an orange outline.](/assets/images/enterprise/site-admin-settings/enable-user-license-drop-down.png)

{% ifversion scim-for-ghes-ga %}
> [!NOTE]
> If SAML with SCIM is enabled, the `scim-admin` setup user will not consume a license. For more information, see [AUTOTITLE](/admin/managing-iam/provisioning-user-accounts-with-scim/configuring-scim-provisioning-for-users#1-create-a-built-in-setup-user).
{% endif %}
