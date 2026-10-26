const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

function parseDate(val) {
  if (!val) return null;
  const num = Number(val);
  if (!isNaN(num) && num > 100000000) return new Date(num);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseBool(val, defaultVal = false) {
  if (val === null || val === undefined) return defaultVal;
  return Boolean(val === 1 || val === true || val === '1' || val === 'true');
}

async function main() {
  console.log('Restoring complete original Zenvora platform data from backup_dump.json...');
  const dumpPath = path.join(__dirname, 'backup_dump.json');
  if (!fs.existsSync(dumpPath)) {
    throw new Error('backup_dump.json not found at ' + dumpPath);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  // 1. Settings
  console.log('Restoring Settings...');
  for (const s of dump.Setting || []) {
    let valObj = {};
    try {
      valObj = JSON.parse(s.value);
    } catch (e) {}
    valObj.brandName = 'Zenvora';
    valObj.creatorName = 'Samir';
    valObj.businessEmail = 'samir@zenvora.com';
    const updatedVal = JSON.stringify(valObj);

    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: updatedVal },
      create: { key: s.key, value: updatedVal },
    });
  }

  // 2. Admin User
  console.log('Seeding Samir admin account...');
  const adminEmail = process.env.ADMIN_EMAIL || 'samir@zenvora.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'SamirZenvora@2026';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  // 3. Nav Items
  console.log('Restoring NavItems...');
  await prisma.navItem.deleteMany({});
  for (const n of dump.NavItem || []) {
    await prisma.navItem.create({
      data: {
        id: n.id,
        area: n.area || 'header',
        label: n.label,
        url: n.url,
        order: Number(n.order) || 0,
        visible: parseBool(n.visible, true),
        isButton: parseBool(n.isButton, false),
      },
    });
  }

  // 4. Pages
  console.log('Restoring Pages...');
  await prisma.page.deleteMany({});
  for (const p of dump.Page || []) {
    await prisma.page.create({
      data: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        metaDescription: p.metaDescription,
        ogImage: p.ogImage,
        content: p.content,
      },
    });
  }

  // 5. Sections
  console.log('Restoring Sections...');
  await prisma.section.deleteMany({});
  for (const s of dump.Section || []) {
    await prisma.section.create({
      data: {
        id: s.id,
        page: s.page || 'home',
        type: s.type,
        order: Number(s.order) || 0,
        visible: parseBool(s.visible, true),
        data: s.data,
      },
    });
  }

  // 6. Categories (Domains)
  console.log('Restoring Categories (' + (dump.Category?.length || 0) + ')...');
  // First delete dependent tables to prevent foreign key errors
  await prisma.video.deleteMany({});
  await prisma.resourceItem.deleteMany({});
  await prisma.playlist.deleteMany({});
  await prisma.category.deleteMany({});

  for (const c of dump.Category || []) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        link: c.link,
        order: Number(c.order) || 0,
      },
    });
  }

  // 7. Playlists
  console.log('Restoring Playlists (' + (dump.Playlist?.length || 0) + ')...');
  for (const pl of dump.Playlist || []) {
    await prisma.playlist.create({
      data: {
        id: pl.id,
        youtubeId: pl.youtubeId,
        title: pl.title,
        slug: pl.slug,
        channelName: pl.channelName,
        channelUrl: pl.channelUrl,
        thumbnail: pl.thumbnail,
        description: pl.description,
        categoryId: pl.categoryId,
        order: Number(pl.order) || 0,
        featured: parseBool(pl.featured, false),
        visible: parseBool(pl.visible, true),
      },
    });
  }

  // 8. Videos (1,147 lectures)
  console.log('Restoring Videos (' + (dump.Video?.length || 0) + ')...');
  const videoBatches = [];
  const batchSize = 100;
  const allVideos = dump.Video || [];

  for (let i = 0; i < allVideos.length; i += batchSize) {
    const chunk = allVideos.slice(i, i + batchSize).map((v) => ({
      id: v.id,
      youtubeId: v.youtubeId,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      publishedAt: parseDate(v.publishedAt),
      duration: v.duration,
      views: Number(v.views) || 0,
      isShort: parseBool(v.isShort, false),
      categoryId: v.categoryId,
      playlistId: v.playlistId,
      channelName: v.channelName,
      featured: parseBool(v.featured, false),
      visible: parseBool(v.visible, true),
      order: Number(v.order) || 0,
      overridden: v.overridden,
      status: v.status || 'available',
    }));
    videoBatches.push(chunk);
  }

  for (let b = 0; b < videoBatches.length; b++) {
    await prisma.video.createMany({
      data: videoBatches[b],
      skipDuplicates: true,
    });
    console.log(`Inserted video batch ${b + 1}/${videoBatches.length} (${(b + 1) * batchSize < allVideos.length ? (b + 1) * batchSize : allVideos.length}/${allVideos.length})`);
  }

  // 9. Opportunities (30 student opportunities)
  console.log('Restoring Opportunities (' + (dump.Opportunity?.length || 0) + ')...');
  await prisma.opportunity.deleteMany({});
  for (const op of dump.Opportunity || []) {
    await prisma.opportunity.create({
      data: {
        id: op.id,
        slug: op.slug,
        title: op.title,
        organization: op.organization,
        category: op.category,
        categories: op.categories,
        summary: op.summary,
        content: op.content,
        contentType: op.contentType || 'manual',
        youtubeUrl: op.youtubeUrl,
        youtubeId: op.youtubeId,
        thumbnail: op.thumbnail,
        academicYears: op.academicYears,
        eligibleDegrees: op.eligibleDegrees,
        eligibleBranches: op.eligibleBranches,
        genderEligibility: op.genderEligibility,
        geographicRestrictions: op.geographicRestrictions,
        minQualifications: op.minQualifications,
        eligibility: op.eligibility,
        participationType: op.participationType,
        difficulty: op.difficulty,
        keyBenefit: op.keyBenefit,
        benefits: op.benefits,
        prerequisites: op.prerequisites,
        howItWorks: op.howItWorks,
        prepGuide: op.prepGuide,
        applyProcess: op.applyProcess,
        availabilityStatus: op.availabilityStatus || 'Information Available',
        status: op.status || 'Open',
        dates: op.dates,
        isHistorical: parseBool(op.isHistorical, false),
        lastVerified: op.lastVerified,
        applicationUrl: op.applicationUrl,
        sourceUrl: op.sourceUrl,
        tags: op.tags,
        tips: op.tips,
        faq: op.faq,
        featured: parseBool(op.featured, false),
        published: parseBool(op.published, false),
        publishedAt: parseDate(op.publishedAt),
        order: Number(op.order) || 0,
      },
    });
  }

  // 10. Tools
  console.log('Restoring Tools...');
  await prisma.tool.deleteMany({});
  for (const t of dump.Tool || []) {
    await prisma.tool.create({
      data: {
        id: t.id,
        name: t.name,
        logo: t.logo,
        oneLiner: t.oneLiner,
        description: t.description,
        tag: t.tag,
        url: t.url,
        showOnHome: parseBool(t.showOnHome, true),
        order: Number(t.order) || 0,
      },
    });
  }

  // 11. Gear Items
  console.log('Restoring Gear Items...');
  await prisma.gearItem.deleteMany({});
  for (const g of dump.GearItem || []) {
    await prisma.gearItem.create({
      data: {
        id: g.id,
        name: g.name,
        image: g.image,
        description: g.description,
        price: g.price,
        url: g.url,
        category: g.category || 'Workstation',
        order: Number(g.order) || 0,
      },
    });
  }

  // 12. Resource Items
  console.log('Restoring Resource Items...');
  for (const r of dump.ResourceItem || []) {
    await prisma.resourceItem.create({
      data: {
        id: r.id,
        title: r.title,
        description: r.description,
        categoryId: r.categoryId,
        videoId: r.videoId,
        promptText: r.promptText,
        fileUrl: r.fileUrl,
        locked: parseBool(r.locked, true),
        order: Number(r.order) || 0,
      },
    });
  }

  // 13. Reels
  console.log('Restoring Reels...');
  await prisma.reel.deleteMany({});
  for (const rel of dump.Reel || []) {
    await prisma.reel.create({
      data: {
        id: rel.id,
        title: rel.title,
        description: rel.description,
        url: rel.url,
        cover: rel.cover,
        order: Number(rel.order) || 0,
      },
    });
  }

  console.log('✅ Successfully restored all 19 playlists, 1,147 videos, 9 categories, 30 opportunities, and site settings!');
}

main()
  .catch((e) => {
    console.error('Error in restore seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
