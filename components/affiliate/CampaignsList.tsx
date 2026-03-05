// Campaigns List Component
// Display special affiliate campaigns

'use client';

import { AffiliateCampaign } from '@/services/affiliateProducts.service';
import { Calendar, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CampaignsListProps {
  campaigns: AffiliateCampaign[];
  loading: boolean;
}

export default function CampaignsList({ campaigns, loading }: CampaignsListProps) {
  const handleCopyCampaignLink = (campaignId: string) => {
    const campaignLink = `${window.location.origin}?campaign=${campaignId}`;
    navigator.clipboard.writeText(campaignLink);
    toast.success('Campaign link copied!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-vt-bg-secondary text-vt-text-secondary';
    }
  };

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-vt-bg-primary rounded-lg border border-vt-border h-64 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-vt-bg-primary rounded-lg border border-vt-border p-12 text-center">
          <p className="text-vt-text-secondary">No active campaigns at the moment</p>
          <p className="text-sm text-vt-text-secondary mt-2">Check back soon for special promotions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-vt-bg-primary rounded-lg border border-vt-border overflow-hidden hover:border-vt-primary transition-colors group"
            >
              {/* Campaign Hero Image */}
              {campaign.imageUrl && (
                <div className="relative w-full h-40 bg-vt-bg-secondary overflow-hidden">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
              )}

              {/* Campaign Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-vt-text-primary">{campaign.name}</h3>
                <p className="text-vt-text-secondary text-sm mt-2">{campaign.description}</p>

                {/* Dates */}
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-vt-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                  <span className="text-vt-text-secondary">→</span>
                  <div className="flex items-center space-x-1 text-vt-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Commission Bonus */}
                {campaign.commissionBonus && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Bonus:</strong> +{(campaign.commissionBonus * 100).toFixed(0)}% extra commission!
                    </p>
                  </div>
                )}

                {/* Products Count */}
                <div className="mt-4 text-sm text-vt-text-secondary">
                  {campaign.products.length} product{campaign.products.length !== 1 ? 's' : ''} in this campaign
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleCopyCampaignLink(campaign.id)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-vt-primary text-white rounded-lg hover:bg-vt-primary-dark transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Campaign Link</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
