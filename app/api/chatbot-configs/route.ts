import { connectToDatabase } from '@/lib/db';
import { ChatbotConfig } from '@/models/ChatbotConfig';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { updateAgentDeploymentStatus } from '@/lib/deployment-utils';

// 🆕 POST MODIFIÉ - UPDATE au lieu de CREATE si connectionId existe
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const config = await request.json();
    const { connectionId } = config; // 🆕 Récupérer connectionId du frontend
    
    console.log(`💾 [CHATBOT CONFIG] Processing config for connection: ${connectionId}`);

    let savedConfig;
    let isNewConfig = false;

    if (connectionId) {
      // 🔄 ESSAYER DE METTRE À JOUR un config existant basé sur connectionId
      const existingConfig = await ChatbotConfig.findOne({ 
        userId: session.user.id,
        connectionId: connectionId
      });

      if (existingConfig) {
        // ✅ MISE À JOUR - Pas de nouveau widget !
        console.log(`🔄 [CHATBOT CONFIG] Updating existing config: ${existingConfig._id}`);
        
        Object.assign(existingConfig, {
          ...config,
          updatedAt: new Date()
        });
        
        savedConfig = await existingConfig.save();
        console.log(`✅ [CHATBOT CONFIG] Updated successfully - Same Widget ID: ${savedConfig._id}`);
        
      } else {
        // 🆕 CRÉATION - Premier save pour cette connection
        console.log(`🆕 [CHATBOT CONFIG] Creating new config for connection: ${connectionId}`);
        
        const newConfig = new ChatbotConfig({
          ...config,
          userId: session.user.id,
          connectionId: connectionId, // 🆕 Lier à la connection
          deployedAt: new Date()
        });
        
        savedConfig = await newConfig.save();
        isNewConfig = true;
        console.log(`✅ [CHATBOT CONFIG] Created new widget: ${savedConfig._id}`);
      }
    } else {
      // 🤷‍♂️ FALLBACK - Ancien comportement si pas de connectionId
      console.log(`⚠️ [CHATBOT CONFIG] No connectionId provided, creating new config`);
      
      const newConfig = new ChatbotConfig({
        ...config,
        userId: session.user.id,
        deployedAt: new Date()
      });
      
      savedConfig = await newConfig.save();
      isNewConfig = true;
    }

    // 🆕 NOUVEAU - Mettre isDeployed = true sur l'agent choisi
    if (config.selectedAgent) {
      await updateAgentDeploymentStatus(config.selectedAgent, true);
      console.log(`🎉 [DEPLOYMENT] Agent ${config.selectedAgent} marked as deployed! (Website Widget)`);
    }
    
    return NextResponse.json({
      success: true,
      message: isNewConfig ? 'Configuration créée avec succès' : 'Configuration mise à jour avec succès',
      widgetId: savedConfig._id.toString(),
      isNewWidget: isNewConfig // 🆕 Informer le frontend si c'est un nouveau widget
    });
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les configs de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const configs = await ChatbotConfig.find({ 
      userId: session.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, configs });
    
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une config
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { widgetId, ...updateData } = await request.json();
    
    const updatedConfig = await ChatbotConfig.findOneAndUpdate(
      { 
        _id: widgetId,
        userId: session.user.id
      },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedConfig) {
      return NextResponse.json(
        { success: false, error: 'Widget non trouvé' },
        { status: 404 }
      );
    }

    // 🆕 NOUVEAU - Mettre à jour isDeployed si l'agent change
    if (updateData.selectedAgent) {
      await updateAgentDeploymentStatus(updateData.selectedAgent, true);
      console.log(`🎉 [DEPLOYMENT] Agent ${updateData.selectedAgent} marked as deployed! (Website Widget Update)`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      widgetId: updatedConfig._id.toString()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}